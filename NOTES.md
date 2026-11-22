After each save point, push it to GitHub.
The AI connects through getKey().
Available OpenAI model with "luna": gpt-5.6-luna

Expo SDK
--------
The app uses Expo SDK 54. The web packages were added with Expo's installer:
`npx expo install react-dom react-native-web @expo/metro-runtime`.

Local and web AI
----------------
Expo Go uses the local AI helper at `EXPO_PUBLIC_LOCAL_AI_URL` (default:
`http://localhost:3001/api/ai`). Run it with `pnpm run dev:api` while testing
on a simulator or local device. The browser uses the local helper during
development and `/api/ai` after deployment. The Vercel function gets the AI
key from `getKey()`; `KEYGEN_URL` and `KEYGEN_TOKEN` are server-only values.

Deploying with Vercel
---------------------
1. Import this GitHub repository into Vercel.
2. Leave the build command as `npx expo export -p web` and the output directory
   as `dist` (both are also in `vercel.json`).
3. Add `KEYGEN_URL` and `KEYGEN_TOKEN` under Vercel Project Settings > Environment
   Variables for the environments that should use the AI function.
4. Deploy. Vercel serves the static Expo web export and routes `/api/ai` to the
   function in `api/ai.js`.

No other Vercel setting is required. Do not commit `.env`, an AI key, or a
Keygen token; `.env` is ignored by Git.
