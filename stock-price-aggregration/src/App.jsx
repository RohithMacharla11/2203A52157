import React, { useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import HeatMap from 'react-heatmap-grid';

const App = () => {
  const [stocksList, setStocksList] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [stockData, setStockData] = useState([]);
  const [allStockData, setAllStockData] = useState({});
  const [timeFrame, setTimeFrame] = useState(5);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({}); // Cache for API responses
  const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5NzA5MDI4LCJpYXQiOjE3NDk3MDg3MjgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImE5Y2Q5MjQxLTY2ZTktNGQ3Yy04ZTc0LWQyODY2OTkzNGIzNCIsInN1YiI6Im1hY2hhcmxhcm9oaXRoMTExQGdtYWlsLmNvbSJ9LCJlbWFpbCI6Im1hY2hhcmxhcm9oaXRoMTExQGdtYWlsLmNvbSIsIm5hbWUiOiJyb2hpdGggbWFjaGFybGEiLCJyb2xsTm8iOiIyMjAzYTUyMTU3IiwiYWNjZXNzQ29kZSI6Ik1WR3dFRiIsImNsaWVudElEIjoiYTljZDkyNDEtNjZlOS00ZDdjLThlNzQtZDI4NjY5OTM0YjM0IiwiY2xpZW50U2VjcmV0IjoiWFpocWZQUHdDdGN3UkJiTiJ9.l2yM0vlFUEKA3CVASw5cR7wnbhStU31JqNHBr0PwuUk";

  const fetchStocksList = async () => {
    try {
      const response = await fetch('http://20.244.56.144/evaluation-service/stocks', {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Stocks list:", data);
      setStocksList(data.stocks.map(stock => stock.ticker));
      setSelectedStock(data.stocks[0]?.ticker || '');
    } catch (error) {
      console.error("Error fetching stock list:", error);
    }
  };

  const fetchStockData = async (ticker, minutes) => {
    if (!ticker) return;
    const cacheKey = `${ticker}-${minutes}`;
    if (cache[cacheKey]) {
      setStockData(cache[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const formattedData = data.map(item => ({
        ticker,
        price: item.price,
        timestamp: item.lastUpdatedAt,
      }));
      setStockData(formattedData);
      setCache(prev => ({ ...prev, [cacheKey]: formattedData }));
    } catch (error) {
      console.error(`Error fetching data for ${ticker}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStockData = async (minutes) => {
    setLoading(true);
    try {
      const promises = stocksList.map(async (ticker) => {
        const cacheKey = `${ticker}-${minutes}`;
        if (cache[cacheKey]) return { ticker, data: cache[cacheKey] };

        const response = await fetch(`http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`, {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        const formattedData = data.map(item => ({
          ticker,
          price: item.price,
          timestamp: item.lastUpdatedAt,
        }));
        setCache(prev => ({ ...prev, [cacheKey]: formattedData }));
        return { ticker, data: formattedData };
      });

      const results = await Promise.all(promises);
      const allData = results.reduce((acc, { ticker, data }) => {
        acc[ticker] = data;
        return acc;
      }, {});
      setAllStockData(allData);
    } catch (error) {
      console.error("Error fetching all stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocksList();
  }, []);

  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock, timeFrame);
    }
  }, [selectedStock, timeFrame]);

  useEffect(() => {
    if (stocksList.length > 0) {
      fetchAllStockData(timeFrame);
    }
  }, [stocksList, timeFrame]);

  const calculateAveragePrice = (ticker, dataSource = stockData) => {
    const tickerData = dataSource.filter((data) => data.ticker === ticker);
    if (tickerData.length === 0) return 0;
    const total = tickerData.reduce((sum, data) => sum + data.price, 0);
    return total / tickerData.length;
  };

  const calculateStandardDeviation = (ticker, dataSource = stockData) => {
    const tickerData = dataSource.filter((data) => data.ticker === ticker);
    if (tickerData.length === 0) return 0;
    const prices = tickerData.map((data) => data.price);
    const mean = calculateAveragePrice(ticker, dataSource);
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance);
  };

  const calculateCorrelation = (ticker1, ticker2) => {
    const data1 = allStockData[ticker1] || [];
    const data2 = allStockData[ticker2] || [];
    if (data1.length !== data2.length || data1.length === 0) return 0;

    const n = data1.length;
    const mean1 = data1.reduce((sum, item) => sum + item.price, 0) / n;
    const mean2 = data2.reduce((sum, item) => sum + item.price, 0) / n;

    const covariance = data1.reduce((sum, _, i) => sum + (data1[i].price - mean1) * (data2[i].price - mean2), 0) / (n - 1);
    const stdDev1 = Math.sqrt(data1.reduce((sum, item) => sum + Math.pow(item.price - mean1, 2), 0) / (n - 1));
    const stdDev2 = Math.sqrt(data2.reduce((sum, item) => sum + Math.pow(item.price - mean2, 2), 0) / (n - 1));

    if (stdDev1 === 0 || stdDev2 === 0) return 0;
    return covariance / (stdDev1 * stdDev2);
  };

  const StockPage = () => {
    if (!stocksList.length) {
      return <div className="p-4">Loading stocks list...</div>;
    }

    const chartData = stockData.map((data) => ({
      timestamp: new Date(data.timestamp).toLocaleTimeString(),
      [data.ticker]: data.price,
    }));

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Stock Prices</h1>
        <div className="mb-4">
          <label className="mr-2">Select Stock:</label>
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="border p-1 rounded mr-4"
          >
            {stocksList.map((ticker) => (
              <option key={ticker} value={ticker}>{ticker}</option>
            ))}
          </select>
          <label className="mr-2">Select Time Frame (minutes):</label>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(Number(e.target.value))}
            className="border p-1 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
          </select>
        </div>
        {loading ? (
          <p>Loading stock data...</p>
        ) : stockData.length === 0 ? (
          <p>No data available for {selectedStock} in the last {timeFrame} minutes.</p>
        ) : (
          <>
            <LineChart width={window.innerWidth < 768 ? 300 : 600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedStock}
                stroke="#8884d8"
                dot={false}
              />
            </LineChart>
            <div className="mt-4">
              <p>Average Price for {selectedStock}: {calculateAveragePrice(selectedStock).toFixed(2)}</p>
            </div>
          </>
        )}
      </div>
    );
  };

  const CorrelationHeatmap = () => {
    if (!stocksList.length) {
      return <div className="p-4">Loading stocks list...</div>;
    }

    const tickers = stocksList;
    const xLabels = tickers;
    const yLabels = tickers;
    const data = tickers.map((ticker1) =>
      tickers.map((ticker2) => calculateCorrelation(ticker1, ticker2))
    );

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Correlation Heatmap</h1>
        {loading ? (
          <p>Loading heatmap data...</p>
        ) : (
          <div>
            <HeatMap
              xLabels={xLabels}
              yLabels={yLabels}
              data={data}
              cellStyle={(background, value) => ({
                background: `rgb(255, ${Math.floor(255 * (1 - value))}, ${Math.floor(255 * (1 - value))})`,
                padding: '4px',
                color: '#000',
              })}
              cellRender={(value) => value && value.toFixed(2)}
              title={(value, x, y) => {
                const tickerX = xLabels[x];
                const tickerY = yLabels[y];
                return `Correlation: ${value?.toFixed(2)}\nAvg ${tickerX}: ${calculateAveragePrice(tickerX, allStockData[tickerX] || []).toFixed(2)}\nStd Dev ${tickerX}: ${calculateStandardDeviation(tickerX, allStockData[tickerX] || []).toFixed(2)}\nAvg ${tickerY}: ${calculateAveragePrice(tickerY, allStockData[tickerY] || []).toFixed(2)}\nStd Dev ${tickerY}: ${calculateStandardDeviation(tickerY, allStockData[tickerY] || []).toFixed(2)}`;
              }}
            />
            <div className="mt-4">
              <p>Color Legend: Red (Strong Positive Correlation) to White (No Correlation)</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4 text-white">
          <Link to="/" className="mr-4">Stock Prices</Link>
          <Link to="/heatmap">Correlation Heatmap</Link>
        </nav>
        <Routes>
          <Route path="/" element={<StockPage />} />
          <Route path="/heatmap" element={<CorrelationHeatmap />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;