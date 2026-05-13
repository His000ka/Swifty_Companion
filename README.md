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
