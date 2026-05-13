## Flow dev du projet

# Init Project
npx create-expo-app@latest . --template default
Objectif repartir 'zero'
    Suppression des pages templates dans app, assets, components, constants, hooks, scripts, assets
    Suppression des packages inutiles
    Ajout de .env dans le .gitignore

    npm uninstall \
        @react-navigation/bottom-tabs \
        @react-navigation/elements \
        expo-haptics \
        expo-symbols \
        react-native-gesture-handler \
        react-native-reanimated \
        react-native-worklets

# API 42
    se rendre sur https://profile.intra.42.fr/oauth/applications et register un nouveau projet
    récuperer (.env.example):
        EXPO_PUBLIC_42_CLIENT_ID=UID
        EXPO_PUBLIC_42_REDIRECT_URI=xxx
        FT_CLIENT_SECRET=SECRET
    
# Tester l'API et la comprendre

    lancer: 
    curl -X POST https://api.intra.42.fr/oauth/token \
  -d "grant_type=client_credentials" \
  -d "client_id=UID" \ 
  -d "client_secret=SECRET"

  verifier que cela renvoie un "access_token"
  tester une réponse de l'API avec cet "access_token", lancer:
  curl -H "Authorization: Bearer TON_ACCESS_TOKEN" \
  https://api.intra.42.fr/v2/users/TON_LOGIN_42 | python3 -m json.tool | head -100

Cela nous permet de comprendre ce que renvoie l'api 42 et donc de préparer les types pour les réponses de l'API !