# Time Wise — Version 1

## Run it

1. Make sure the computer and phone are on the same Wi-Fi.
2. Start the AI helper: `npm run helper`.
3. In another terminal, start Expo for the phone: `npx expo start --lan`.
4. Scan the Expo QR code with Expo Go. The helper uses this computer address: `http://192.168.0.94:3002/ai`.

The helper reads the OpenAI key only through `server/getKey.js`. The app never receives the key or Keygen token. `.env` is ignored by Git. If the computer’s Wi-Fi address changes, update the helper address in `lib/ai.js` and restart Expo. Use LAN mode; a tunnel cannot reach a helper that is only on the home network.

## SDK and checks

The app uses Expo SDK 58 because Expo Go on the phone supports SDK 58. `npx expo install --fix` was run. `npx expo-doctor` passes after the app name was corrected.

## What is done

- History: manually log time used for an app and see recent sessions. Data is saved on the phone.
- Personalized limits: answer a short daily checklist about homework, sleep, and break timing.
- AI suggestion: the helper sends the checklist and the AI instructions from `BRIEF.md` to the model `gpt-5.6-luna`.
- Consent and safety: the AI suggests; the user must choose “Use this suggested limit.” The user can change it.
- Break reminder: start a simple in-app break timer.
- Before-limit reminder: the plan shows minutes remaining for the chosen app.

The first version uses manual session entries because Expo Go cannot read every phone’s real app-usage history. Notifications, app blocking, goals, and automatic device-wide limits are not included yet.

## Maybe Later

- The user can specify their goals to help the AI suggest limits accordingly.
- The user can decide what they plan to do before opening an app.
- The user can get a pause before they enter a potentially distracting app.
- The user can answer questions from the AI to reflect on their screen use.
- The user can receive notifications if they exceed their set screen time limit.
- The user can choose to have the AI suggest fun activities outside of screen time.
- The user can receive encouragement messages for staying within their limits.
- The user can disable certain apps temporarily if they need a break from them.
- The user can provide feedback to the AI to improve its suggestions over time.

After each save point, push it to GitHub.

## Next

Test the complete flow on the student’s phone, collect feedback, and improve the written entry and short video before the December 2026 deadlines.
