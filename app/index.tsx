import { useState } from 'react';
import { View, Text, TextInput, 
         TouchableOpacity, ActivityIndicator, 
         StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { getUser } from '../services/api';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
    const router = useRouter();
    const { token, user, isLoading, login, logout } = useAuth();
    const [searchLogin, setSearchLogin] = useState('');
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    async function handleSearch() {
        if (!searchLogin.trim() || !token) return;
        
        setIsSearching(true);
        setSearchError(null);
        
        try {
            await getUser(searchLogin.trim(), token);
            router.push({
                pathname: '/profile/[login]',
                params: { login: searchLogin.trim() }
            });
        } catch (error) {
            if (error instanceof Error) {
            if (error.message === 'NOT_FOUND')
                setSearchError(`Login "${searchLogin}" introuvable.`);
            else if (error.message === 'UNAUTHORIZED')
                setSearchError('Session expirée. Reconnecte-toi.');
            else
                setSearchError('Erreur réseau. Vérifie ta connexion.');
            }
        } finally {
            setIsSearching(false);
        }
    }
    // État 1 : chargement initial de l'auth
if (isLoading) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
        </View>
    );
}

// État 2 : non connecté
if (!token) {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Swifty Companion</Text>
        <TouchableOpacity style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>Se connecter avec 42</Text>
        </TouchableOpacity>
    </View>
  );
}

// État 3 : connecté
return (
    <View style={styles.container}>
        <Text style={styles.title}>Swifty Companion</Text>
        <Text style={styles.subtitle}>Bonjour, {user?.login} 👋</Text>
        
        <TextInput
        style={styles.input}
        placeholder="Rechercher un login 42..."
        value={searchLogin}
        onChangeText={(text) => {
            setSearchLogin(text);
            setSearchError(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        />
        
        {searchError && (
        <Text style={styles.error}>{searchError}</Text>
        )}
        
        <TouchableOpacity 
        style={[styles.button, isSearching && styles.buttonDisabled]} 
        onPress={handleSearch}
        disabled={isSearching}
        >
        {isSearching 
            ? <ActivityIndicator color="white" />
            : <Text style={styles.buttonText}>Rechercher</Text>
        }
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    opacity: 0.7,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  button: {
    width: '100%',
    backgroundColor: '#00babc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 8,
    padding: 8,
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
  },
});