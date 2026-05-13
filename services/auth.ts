import Constants from 'expo-constants'; 
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';


const CLIENT_ID = process.env.EXPO_PUBLIC_42_CLIENT_ID!;
const REDIRECT_URI = process.env.EXPO_PUBLIC_42_REDIRECT_URI!;
const CLIENT_SECRET = Constants.expoConfig?.extra?.ftClientSecret;
const TOKEN_KEY = 'ft_access_token';
const REFRESH_KEY = 'ft_refresh_token';
const EXPIRY_KEY = 'ft_token_expiry';

async function generateCodeVerifier(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32); // 32 octets = 256 bits
  // Convertir en base64url (base64 sans +, /, =)
  return btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return digest
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function buildAuthUrl(codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'public',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `https://api.intra.42.fr/oauth/authorize?${params.toString()}`;
}

async function exchangeCodeForToken(code: string, codeVerifier: string) {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
        }).toString(),
    });
    if (!response.ok) throw new Error(`Token exchange failed: ${response.status}`);
    return response.json();
}

export async function saveToken(accessToken: string, refreshToken: string, expiresIn: number) {
    const expiry = Date.now() + expiresIn * 1000;
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
    await SecureStore.setItemAsync(EXPIRY_KEY, expiry.toString());
}

export async function getStoredToken(): Promise<string | null> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const expiry = await SecureStore.getItemAsync(EXPIRY_KEY);
    if (!token || !expiry) return null;
    // Token expiré ?
    if (Date.now() > parseInt(expiry)) return null;
    return token;
}

export async function clearTokens() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(EXPIRY_KEY);
}

export async function login(): Promise<boolean> {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = await generateCodeVerifier(); // réutilise la même logique pour générer un state random

  const authUrl = buildAuthUrl(codeChallenge, state);

  // Ouvre le navigateur système pour le login 42
  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

  if (result.type !== 'success') return false;

  // Parse l'URL de retour pour extraire code et state
  const url = new URL(result.url);
  const returnedState = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  // Vérifie le state anti-CSRF
  if (returnedState !== state || !code) return false;

  // Échange le code contre un token
  const tokenData = await exchangeCodeForToken(code, codeVerifier);
  await saveToken(tokenData.access_token, tokenData.refresh_token, tokenData.expires_in);

  return true;
}