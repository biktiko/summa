import { gapi } from 'gapi-script';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let tokenClient;

// Load the new Google Identity Services script dynamically
const loadGisScript = () => {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.oauth2) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Keep track of initialization state
let isInitialized = false;
let initPromise = null;

export const initGoogleCalendar = async () => {
    if (isInitialized) return true;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            // 1. Load gapi client if not loaded
            if (!window.gapi) {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://apis.google.com/js/api.js';
                    script.onload = () => gapi.load('client', resolve);
                    document.body.appendChild(script);
                });
            } else if (!window.gapi.client) {
                await new Promise((resolve) => gapi.load('client', resolve));
            }

            // 2. Initialize gapi client (API Key only)
            // Ensure we don't re-init if already done (though gapi handles multiple inits usually)
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: DISCOVERY_DOCS,
            });

            // 3. Load Calendar API explicitly
            try {
                await gapi.client.load('calendar', 'v3');
            } catch (loadError) {
                console.error("Failed to load Calendar API", loadError);
            }

            // 4. Load GIS (Google Identity Services)
            await loadGisScript();

            // 5. Initialize Token Client
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES + " https://www.googleapis.com/auth/userinfo.email",
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        gapi.client.setToken(tokenResponse);
                    }
                },
            });

            console.log("Google Calendar API Initialized Successfully");
            isInitialized = true;
            return true;
        } catch (error) {
            console.error("Error initializing Google Calendar API", error);
            initPromise = null; // Allow retry
            alert(`Google Calendar Init Error: ${JSON.stringify(error.result || error.message || error)}`);
            throw error;
        }
    })();

    return initPromise;
};

export const signInToGoogle = async () => {
    if (!tokenClient) {
        console.log("Token client missing, initializing...");
        await initGoogleCalendar();
        if (!tokenClient) {
            throw new Error("Google Calendar API failed to initialize (TokenClient still missing)");
        }
    }

    return new Promise((resolve, reject) => {
        // Override the callback to handle the promise
        tokenClient.callback = (resp) => {
            if (resp.error !== undefined) {
                reject(resp);
            }
            // Manually set the token for gapi
            gapi.client.setToken(resp);
            resolve(resp);
        };

        // Request access token (triggers popup)
        tokenClient.requestAccessToken({ prompt: 'consent' });
    });
};

export const getUserProfile = async () => {
    try {
        const response = await gapi.client.request({
            'path': 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
        });
        return response.result;
    } catch (e) {
        console.error("Error fetching user profile", e);
        return null;
    }
};

export const signOutFromGoogle = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken('');
        });
    }
};

export const isSignedIn = () => {
    if (!window.gapi || !window.gapi.client) return false;
    const token = gapi.client.getToken();
    return token !== null && token.access_token !== undefined;
};

export const addEventToCalendar = async (eventData) => {
    if (!isSignedIn()) {
        // Try to sign in implicitly if not signed in
        try {
            await signInToGoogle();
        } catch (e) {
            console.warn("User declined sign in", e);
            return null;
        }
    }

    try {
        const response = await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': eventData
        });
        return response.result;
    } catch (error) {
        console.error("Error adding event to calendar", error);
        // If 401, token might be expired
        if (error.status === 401) {
            await signInToGoogle(); // Refresh token
            // Retry once
            const response = await gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': eventData
            });
            return response.result;
        }
        throw error;
    }
};

export const updateEvent = async (eventId, eventData) => {
    if (!isSignedIn()) return null;

    try {
        const response = await gapi.client.calendar.events.patch({
            'calendarId': 'primary',
            'eventId': eventId,
            'resource': eventData
        });
        return response.result;
    } catch (error) {
        console.error("Error updating event in calendar", error);
        throw error;
    }
};

export const deleteEvent = async (eventId) => {
    if (!isSignedIn()) return null;

    try {
        const response = await gapi.client.calendar.events.delete({
            'calendarId': 'primary',
            'eventId': eventId
        });
        return response.result;
    } catch (error) {
        console.error("Error deleting event from calendar", error);
        throw error;
    }
};

export const createEventObject = (title, description, startTime, durationMinutes = 60, attendees = [], options = {}) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const event = {
        'summary': title,
        'description': description,
        'start': {
            'dateTime': start.toISOString(),
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
            'dateTime': end.toISOString(),
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    };

    // Reminders
    if (options.reminders && options.reminders.overrides && options.reminders.overrides.length > 0) {
        event.reminders = {
            'useDefault': false,
            'overrides': options.reminders.overrides
        };
    } else if (options.reminders && options.reminders.useDefault) {
        event.reminders = { 'useDefault': true };
    } else {
        // Default behavior if nothing passed
        event.reminders = {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 }
            ]
        };
    }

    if (attendees && attendees.length > 0) {
        event.attendees = attendees.map(email => ({ 'email': email }));
    }

    if (options.recurrence) {
        event.recurrence = options.recurrence;
    }

    return event;
};
