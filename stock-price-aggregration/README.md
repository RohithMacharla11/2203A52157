# Stock Price Aggregation Web Application
## Project Details
Name : Rohith Macharla
Roll Number : 2203A52157

## Submission Folder

2203A52157/: Contains the following:
App.jsx: The source code.
Screenshots (if included; otherwise submitted separately):
stock-page-desktop.png
stock-page-mobile.png
heatmap-desktop.png
heatmap-mobile.png

## Overview
This project is a React-based web application that aggregates stock price data from a test stock exchange server. It provides two main features:

Stock Page: Displays a line chart of stock prices for a selected stock over a specified time frame (5, 10, 15, or 30 minutes), along with the average price.
Correlation Heatmap: Shows a heatmap of correlations between all available stocks, with average price and standard deviation displayed on hover.

The application is built using React, Vite, and Tailwind CSS, with recharts for the line chart and react-heatmap-grid for the heatmap.
Features
Stock Page

Select a stock and time frame to view its price history.
Displays a line chart with the average price highlighted.

Correlation Heatmap

View correlations between all stocks with a color gradient from red (strong positive correlation) to white (no correlation).
Hover over cells to see average price and standard deviation for each stock pair.

Additional Features

Responsive Design: The app adjusts chart sizes for mobile and desktop views.
Optimized API Calls: Uses parallel data fetching and caching to reduce load times.



Notes
CORS
The test server may require a CORS workaround (as noted in the setup instructions) to allow requests from http://localhost:3000.
Access Token
Ensure the ACCESS_TOKEN in App.jsx is updated with a valid token from the /auth endpoint.
Time Frame
The application supports time frames of 5, 10, 15, and 30 minutes, as specified in the requirements.
Troubleshooting
CORS Errors
If you see CORS errors in the browser console, use the workaround mentioned in the setup instructions.
401 Unauthorized
If API requests fail with a 401 status, verify the ACCESS_TOKEN in App.jsx.
Slow Loading
The application has been optimized for faster loading, but if the test server is slow, consider reducing the number of stocks fetched for the heatmap (e.g., by modifying the tickers array in CorrelationHeatmap).
Submission Details
Roll Number
2203A52157
Folder
All submission files are in the 2203A52157 folder.
Submission Time
Submitted before the deadline on June 12, 2025.
