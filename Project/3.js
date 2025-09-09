const quoteTextEl = document.getElementById('quote-text');
const quoteAuthorEl = document.getElementById('quote-author');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const newWallpaperBtn = document.getElementById('newWallpaperBtn');
const body = document.body;

const BASE_URL = 'https://www.goodreads.com/quotes/list/13459225';
const MAX_PAGES = 14; 
let allQuotes = [];
let availableQuotes = [];

// Fetch quotes from a single Goodreads page
async function fetchQuotesFromPage(page) {
    const response = await fetch(`${BASE_URL}?page=${page}`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const quoteElements = doc.querySelectorAll('.quoteText');
    const quotes = [];
    quoteElements.forEach(el => {
        const fullText = el.textContent.trim();
        // The quote text is before the first '―', and the author is after
        const parts = fullText.split('―');
        if (parts.length > 1) {
            let text = parts[0].trim();
            // Clean up any extra newlines or spaces
            text = text.replace(/[\n\r]/g, '').trim();
            let author = parts[1].trim();
            // Clean up source information if present (e.g., "(Book Title)")
            const sourceIndex = author.indexOf(', ');
            if (sourceIndex > -1) {
                author = author.substring(0, sourceIndex);
            }

            quotes.push({ text: text, author: author });
        }
    });

    return quotes;
}

// Fetch all quotes from all pages
async function fetchAllQuotes() {
    const fetchPromises = [];
    for (let i = 1; i <= MAX_PAGES; i++) {
        fetchPromises.push(fetchQuotesFromPage(i));
    }
    const results = await Promise.all(fetchPromises);
    allQuotes = results.flat();
    availableQuotes = [...allQuotes];
    console.log(`Fetched ${allQuotes.length} quotes.`);
}

// Display a random quote from the available pool
function displayRandomQuote() {
    if (availableQuotes.length === 0) {
        // If all quotes have been used, reset the pool
        availableQuotes = [...allQuotes];
        console.log("All quotes shown, resetting pool.");
    }
    
    if (availableQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuotes.length);
        const quote = availableQuotes[randomIndex];

        quoteTextEl.textContent = quote.text;
        quoteAuthorEl.textContent = `- ${quote.author}`;

        // Remove the displayed quote from the pool to avoid repetition
        availableQuotes.splice(randomIndex, 1);
    } else {
        quoteTextEl.textContent = "No quotes available.";
        quoteAuthorEl.textContent = "";
    }
}

// Fetch a new abstract wallpaper from Unsplash
async function fetchNewWallpaper() {
    try {
        const response = await fetch('https://source.unsplash.com/random/1600x900/?abstract');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        body.style.backgroundImage = `url('${response.url}')`;
        console.log("New wallpaper set.");
    } catch (error) {
        console.error('Failed to fetch new wallpaper:', error);
        // Fallback to a solid color if fetching fails
        body.style.backgroundImage = 'none';
        body.style.backgroundColor = '#333';
    }
}

// Initial setup
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAllQuotes();
    displayRandomQuote();
    fetchNewWallpaper();
});

// Event listeners for the buttons
newQuoteBtn.addEventListener('click', displayRandomQuote);
newWallpaperBtn.addEventListener('click', fetchNewWallpaper);xx