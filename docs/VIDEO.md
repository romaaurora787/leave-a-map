# Demo video: script and shot list (T34)

**Target: 2:50, hard limit under 3:00.** The story is **After a loss**: a family, or an executor, sorting out the accounts of someone who has died. The other mode (your own school or work address closing) gets one line at the end. Agreed with Kanishk's agent in the huddle (messages 57–58). Everything is filmed on the fictional estate sample (Robin Hale).

**Deadlines:**
- Kanishk's dry run on his Nano laptop (lane 2, lane 3's "not recognised → asked the cloud" path, and the letter rewrite) before filming.
- Filmed and cut before the team target, **Sun 29 Nov, 20:00 IST**. Devpost closes **Tue 1 Dec, 03:30 IST** (Mon 30 Nov, 2:00 PM PT), with no extension.

## Rules for every frame

- **No brand logos, and no third-party brand names in captions or voice.** Use categories ("bank", "email provider"). Firebase, Gemini, Gemini Nano and Chrome are the platform and may be named.
- **No real mail, accounts or people.** Use only the estate sample, a fresh Chrome profile with no other tabs or bookmarks, and no notifications. Every person, bank and service in the sample is fictional, and its phone numbers and postcodes are reserved for drama.
- **Measured numbers only.** Every number on screen comes from the run being filmed or from the README's measured table. Read counts off the screen; never edit them afterwards. Show an evaluation result only if it is published in the README, and then exactly as published, bad parts included.
- **Never fake on-device footage.** Lane 2 and rewrite shots come from a machine where Nano reports `available` without bypass flags.
- **Gentle tone.** This is about someone who has died. No upbeat music, no jokes, no "hack your grief". Calm voice, plenty of pauses.

## Script

The voice is about 350 words over 2:50 with the optional sentence (about 330 without), under 125 words a minute, which leaves room for pauses and on-screen reading.

| Time | Beat | On screen | Voice | Caption |
|---|---|---|---|---|
| 0:00–0:10 | **Hook** | Black, plain white text, one line at a time: "When someone dies, their family has to find every bank, bill and account they had." / "The clues are in their email." No statistic | "When someone dies, their family has to find every bank, bill and account they had. Most of the clues are in one place: their email." | – |
| 0:10–0:30 | **Who, the problem, the promise** (the FAQ's first 30 s) | The start screen. "After a loss" is picked. The ownership tick: "I'm allowed to open this mailbox, for example as their executor or next of kin…". The cursor goes to "Try it on a made-up sample" under the headline and clicks it | "Leave a Map is for that family, or the executor. You export their mailbox, with the provider's permission, and it's read here, on this laptop. Rules first, then Gemini Nano on the device. The cloud only sees what you approve." | "For families and executors"; then "Rules → Gemini Nano on-device → cloud only with consent" |
| 0:30–0:55 | **Lane 1, rules** | Split screen with DevTools → Network, which stays empty. "Their accounts, money first" fills in: the groups Banks and payments, Pensions and investments, Insurance, Bills and utilities. Open one card's "Why this account?" drawer: the quote, the date, "Seen", the "rules" badge. Scroll to "Looks fake" | "First, plain rules, in a page that isn't allowed to connect to anything. Twenty-six emails in milliseconds. Money first: banks, pensions, insurance, bills. Each account says why it's here, with the line and the date from the email. An email that looks fake is set aside, not listed." | "Lane 1 · rules · no network" |
| 0:55–1:15 | **Lane 2, Gemini Nano** | Click "On-device AI"; cards gain "on-device AI" badges. Open a drawer showing `inferenceSource: on_device`. The Network panel is still empty | "Then Gemini Nano reads one cleaned email per account, on this device. Firebase AI Logic runs it in on-device-only mode, and we check that every answer came from the device. The network panel stays empty." | "Lane 2 · Gemini Nano · ONLY_ON_DEVICE" |
| 1:15–1:50 | **Lane 3, the cascade** (core beat) | "6 services can't be placed from the emails alone." Click "Look these up". The consent window opens on the second site: every box unticked, "What is sent", the 18+ box. Tick it, click "Select all except health and money", then send. Back on the map, each answer reads **"On-device: not recognised → asked the cloud"** with cloud badges. Film whatever actually happens; if the trail differs, change the voice to match it, not the footage | "Six services can't be placed from the emails alone. Only their web addresses can leave: only the ones you tick, in a separate window. Money and health stay unticked. The on-device model tries first. When it doesn't recognise a service, and only then, the cloud model answers. Every line says which one did." | "Lane 3 · PREFER_ON_DEVICE → ONLY_IN_CLOUD" |
| 1:50–2:20 | **What the family does next** | The Harbourline Bank card: the step "Contact Harbourline Bank's bereavement or estates team", then "How to reach": the bereavement email, phone and postal address. Open "Write to Harbourline Bank: a ready-made message"; the cursor rests on the [blanks]. **Optional (only if Kanishk's rewrite rerun passes):** click "More formal", the letter is rewritten, "Rewritten on this device by Gemini Nano", the [blanks] still there. Then "Don't sign in as them" | "Then the part a family actually needs. For the bank: its bereavement team's email, phone and address, taken only from emails that passed the sender checks, so a scam's number is never used. A ready-made letter, with blanks only you can fill in. *(Optional:)* Gemini Nano can make it more formal, on the device, and it keeps every blank. And always: don't sign in as them." | "Contacts only from emails that passed sender checks"; optional "Rewritten on-device · blanks kept" |
| 2:20–2:30 | **No Nano** | Akshita's Mac without Nano: the banner "Not available in this browser, so only the rules ran", and the greyed-out rewrite buttons with "Rewriting on this device needs Chrome on a computer with its built-in AI." | "Without Gemini Nano, nothing breaks. The rules still find everything, and the AI buttons say what they need." | "Without Gemini Nano" |
| 2:30–2:42 | **Proof** | The privacy receipt: "N web addresses looked up with your approval, 0 other requests from this page", next to the empty Network panel | "And the receipt: the web addresses you approved, and zero other requests from the page that read the mail." | "Measured: 0 requests from the scan page" |
| 2:42–2:50 | **Close** | A few ticks ("3 of 13 done"), then "Print or save as PDF". Black: "Leave a Map · Firebase AI Logic · github.com/romaaurora787/leave-a-map · Apache-2.0" | "Tick them off at your own pace, and print the list for the family. The same scan helps when your own school or work address is closing. Leave a Map." | – |

**If the rewrite isn't verified:** drop the optional sentence and the "More formal" click, and hold on the letter a few seconds longer, then show "My notes" on the card. The beat still fits 1:50–2:20.

**The counts depend on the run.** "6 services", "13 accounts" and the receipt's N come from the estate sample as it is today (26 emails, 13 accounts, 6 services for the cloud lookup, 1 "Looks fake"). Read them off the screen while filming. If T32 or issue #8 results are published in the README by then, add one caption at 2:30 with the headline, worded exactly as in the README.

## Shot list

| # | Shot | Machine | Who | Setup | Needs |
|---|---|---|---|---|---|
| S1 | Hook text cards | Editor | Akshita | Titles only | – |
| S2 | Start screen: "After a loss", the ownership tick, "Try it on a made-up sample" | Nano laptop | Kanishk | Fresh profile, 1280×800 window, browser zoom 110% | Live site with main deployed |
| S3 | Lane 1 with DevTools Network open: the money groups, one evidence drawer, "Looks fake" | Nano laptop | Kanishk | DevTools docked right, "Preserve log" on, filter cleared | – |
| S4 | Lane 2: "On-device AI" run, drawer with `inferenceSource: on_device`, Network still empty | Nano laptop | Kanishk | `LanguageModel.availability()` is `available` beforehand, model already downloaded so the take is short | Nano download finished; dry run passed |
| S5 | Lane 3: panel → consent window → "not recognised → asked the cloud" on the cards | Nano laptop | Kanishk | Both windows visible side by side. Paid tier on | Dry run of this path passed |
| S6 | Harbourline Bank: steps, "How to reach", the letter; optional "More formal" | Nano laptop | Kanishk | Same session as S5 | Rewrite rerun passed (else film the letter only) |
| S7 | No Nano: the banner and the greyed-out rewrite buttons | Akshita's Mac | Akshita | Fresh profile, After a loss sample | – |
| S8 | Receipt next to the Network panel | Nano laptop | Kanishk | After S5, same session, so the counts are real | – |
| S9 | Ticks and "Print or save as PDF" | Nano laptop | Kanishk | Tick 3 cards in the same session | – |
| S10 | Closing card | Editor | Akshita | – | – |

**Recording:** 1080p, 30 fps. Use system cursor highlighting and no system sound. Record each shot as its own clip with a few seconds of padding. The voice is recorded separately and laid over the clips.

## Before filming (checklist)

- [ ] `main` is deployed to both sites, or every shot uses the same local build.
- [x] The cloud lookup is switched on and works on the hosted site (paid tier, 24 Nov).
- [x] Hosted reCAPTCHA attests, with App Check enforced (24 Nov). S5 to S8 can be filmed on the live sites.
- [ ] Kanishk's dry run on the Nano laptop passed: lane 2, lane 3's "not recognised → asked the cloud" path, and (for the optional beat) "More formal" with the blanks kept.
- [ ] Fresh Chrome profile: no bookmarks bar, extensions, other tabs, signed-in account or notifications.
- [ ] Nano machine: Nano is `available` with no bypass flag. Take a screenshot of `chrome://on-device-internals` for our own record only. Don't put it in the video.
- [ ] Every number to be shown comes from the filmed run or the README's measured table.

## After filming (checklist)

- [ ] The cut is under 3:00 (aim for 2:50).
- [ ] No brand names, logos, real people, real mail, or account names visible anywhere. Check every frame of S5 and S6, including the consent window.
- [ ] Captions (subtitles) uploaded.
- [ ] Public on the video platform, with the description below.
- [ ] The link is in the Devpost submission (T35).

## Video description

> Leave a Map helps a family or an executor list the accounts of someone who has died, money first, from an export of their mailbox. The mail is read on the device: rules, then Gemini Nano on-device through Firebase AI Logic. Only web addresses you approve go to a cloud model, in a separate window. A list, not legal advice.
>
> It also works for your own email address when it is closing: school, work or an old provider.
>
> Filmed on a fictional sample mailbox. Every person, bank and service in it is made up.
>
> Code (Apache-2.0): https://github.com/romaaurora787/leave-a-map
