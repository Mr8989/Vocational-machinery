import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader, CheckCircle, XCircle, Search, RefreshCw } from "lucide-react";

function PaymentAdmin() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // Filter by status: all, success, pending, failed
    const [searchTerm, setSearchTerm] = useState(''); // Search by email or reference
    const [transactionRef, setTransactionRef] = useState('');
    const [otp, setOtp] = useState("")
  

  // Function to fetch transactions from the backend
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real application, you would add authentication (e.g., an admin token)
      const token = localStorage.getItem('adminAuthToken'); // Example: get admin token

      const response = await fetch('http://localhost:5000/api/payment/verify', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
           //'Authorization': `Bearer ${token}` // Uncomment if your admin endpoint requires authentication
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch transactions.');
      }

      const data = await response.json();
      setTransactions(data.transactions); // Assuming backend returns { transactions: [...] }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []); // Fetch on component mount

  // Filtered and searched transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
                          transaction.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Helper to format amount
  const formatAmount = (amountInMinorUnits) => {
    if (typeof amountInMinorUnits !== 'number' || isNaN(amountInMinorUnits)) {
      return 'N/A';
    }
    return (amountInMinorUnits / 100).toFixed(2); // Convert from minor units (e.g., kobo/pesewas) to major units
  };

  // Helper to get status icon and color
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'success':
        return <span className="flex items-center text-green-500"><CheckCircle className="mr-1 h-4 w-4" /> Success</span>;
      case 'pending':
        return <span className="flex items-center text-yellow-500"><Loader className="mr-1 h-4 w-4 animate-spin" /> Pending</span>;
      case 'failed':
      case 'failed_korapay_init':
      case 'verification_failed_korapay':
      case 'amount_mismatch':
      case 'backend_error':
        return <span className="flex items-center text-red-500"><XCircle className="mr-1 h-4 w-4" /> Failed</span>;
      default:
        return <span className="text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <motion.h1
        className="text-4xl font-extrabold text-center mb-10 text-emerald-300"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Payment Transaction Dashboard
      </motion.h1>

      <motion.div
        className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or reference..."
              className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="failed_korapay_init">Failed (KoraPay Init)</option>
            <option value="verification_failed_korapay">
              Verification Failed
            </option>
            <option value="amount_mismatch">Amount Mismatch</option>
            <option value="backend_error">Backend Error</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchTransactions}
            className="w-full sm:w-auto flex items-center justify-center py-2 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
            <p className="text-lg text-gray-300">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-10">
            <p className="text-lg">Error: {error}</p>
            <p className="text-sm text-gray-400">
              Please check your backend server and network connection.
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p className="text-lg">
              No transactions found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg"
                  >
                    Reference
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Amount (GHS)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Course
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Mobile Info
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <motion.tr
                    key={transaction.reference}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {transaction.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${formatAmount(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.metadata?.selectedCourse || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.metadata?.mobileNetwork} -{" "}
                      {transaction.metadata?.mobileNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusDisplay(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/*Reference input */}
              <input
                type="text"
                placeholder="Enter Transaction Reference"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="px-4 py-4 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-emerald-500"
              />
              {/* Otp input*/}
              <input
                type="text"
                placeholder="Enter otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {/* Verify Button */}
              <button
                onClick={fetchTransactions}
                className="flex items-center justify-center py-2 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !transactionsRef || !otp}
              >
                <RefreshCw
                  className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />{" "}
                Verify
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default PaymentAdmin
