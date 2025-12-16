import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * BidInput Component for Auction System
 * Handles formatted numeric input with validation and smart suggestions
 *
 * @param {number|string} currentPrice - Current highest bid (number or formatted string)
 * @param {number|string} stepPrice - Minimum bid increment (number or formatted string)
 * @param {function} placeBid - Callback function when bid is submitted
 */
export function BidInput({ currentPrice, stepPrice, placeBid }) {
  // State Management
  const [bidValue, setBidValue] = useState(""); // Raw numeric value
  const [displayValue, setDisplayValue] = useState(""); // Formatted display value
  const [error, setError] = useState(""); // Error message
  const [suggestions, setSuggestions] = useState([]); // Smart suggestions for invalid step
  const [isLoading, setIsLoading] = useState(false); // Loading state for submission

  /**
   * Sanitize formatted price string to raw number
   * Handles formats like "290.000.000.00" → 290000000 or "500.000" → 500000
   * @param {string|number} priceStr - Price as formatted string or number
   * @returns {number} Raw numeric value
   */
  const sanitizePrice = (priceStr) => {
    // If already a number, return as-is
    if (typeof priceStr === "number") return priceStr;
    
    if (!priceStr) return 0;

    // Convert to string if needed
    let str = String(priceStr).trim();

    // Remove trailing .00 or similar decimals (e.g., ".00", ".50")
    str = str.replace(/\.\d{1,2}$/, "");

    // Remove all dots and commas (separators used in formatted numbers)
    str = str.replace(/[.,]/g, "");

    // Convert to integer
    return parseInt(str, 10) || 0;
  };

  // Sanitize props to handle formatted string input
  const sanitizedCurrentPrice = sanitizePrice(currentPrice);
  const sanitizedStepPrice = sanitizePrice(stepPrice);

  // Calculate minimum valid bid using sanitized values
  const minBid = sanitizedCurrentPrice + sanitizedStepPrice;

  /**
   * Format number with thousand separators (Vietnamese style: dots)
   * 100000000 → 100.000.000
   */
  const formatNumberDisplay = (num) => {
    if (!num && num !== 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  /**
   * Calculate smart suggestions for invalid step bids
   * Returns closest valid lower and upper bids
   */
  const calculateSuggestions = (inputValue) => {
    if (inputValue < minBid) return [];

    const diff = inputValue - sanitizedCurrentPrice;
    const remainder = diff % sanitizedStepPrice;

    if (remainder === 0) return []; // Valid step, no suggestions needed

    // Calculate closest valid lower and upper bids
    const lowerSteps = Math.floor(diff / sanitizedStepPrice);
    const upperSteps = Math.ceil(diff / sanitizedStepPrice);

    const lowerBid = sanitizedCurrentPrice + lowerSteps * sanitizedStepPrice;
    const upperBid = sanitizedCurrentPrice + upperSteps * sanitizedStepPrice;

    return [
      { label: formatNumberDisplay(lowerBid), value: lowerBid },
      { label: formatNumberDisplay(upperBid), value: upperBid },
    ];
  };

  /**
   * Validate bid value and update errors/suggestions
   */
  const validateBid = (value) => {
    if (!value || value === 0) {
      setError("");
      setSuggestions([]);
      return true;
    }

    // Check if bid meets minimum requirement (using sanitized price)
    if (value < minBid) {
      setError(`Giá đấu phải tối thiểu ${formatNumberDisplay(minBid)} đ`);
      setSuggestions([]);
      return false;
    }

    // Check if bid is a valid multiple of stepPrice (using sanitized values)
    const diff = value - sanitizedCurrentPrice;
    if (diff % sanitizedStepPrice !== 0) {
      setError(
        `Giá đấu phải tăng theo bước ${formatNumberDisplay(sanitizedStepPrice)} đ`
      );
      setSuggestions(calculateSuggestions(value));
      return false;
    }

    // Valid bid
    setError("");
    setSuggestions([]);
    return true;
  };

  /**
   * Handle input change with formatting
   */
  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    // Only allow digits
    const numericOnly = inputValue.replace(/\D/g, "");

    if (!numericOnly) {
      setBidValue("");
      setDisplayValue("");
      setError("");
      setSuggestions([]);
      return;
    }

    const numValue = parseInt(numericOnly, 10);

    // Update states
    setBidValue(numValue);
    setDisplayValue(formatNumberDisplay(numValue));

    // Validate in real-time
    validateBid(numValue);
  };

  /**
   * Handle increment button (+)
   */
  const handleIncrement = () => {
    const newValue = bidValue ? bidValue + sanitizedStepPrice : minBid;
    setBidValue(newValue);
    setDisplayValue(formatNumberDisplay(newValue));
    validateBid(newValue);
  };

  /**
   * Handle decrement button (-)
   */
  const handleDecrement = () => {
    if (bidValue <= minBid) return; // Prevent going below minBid
    const newValue = bidValue - sanitizedStepPrice;
    setBidValue(newValue);
    setDisplayValue(formatNumberDisplay(newValue));
    validateBid(newValue);
  };

  /**
   * Apply suggestion
   */
  const applySuggestion = (suggestedValue) => {
    setBidValue(suggestedValue);
    setDisplayValue(formatNumberDisplay(suggestedValue));
    setError("");
    setSuggestions([]);
  };

  /**
   * Handle bid submission
   */
  const handleSubmitBid = async () => {
    // Validate before submission
    if (!validateBid(bidValue)) return;

    if (bidValue < minBid) {
      setError(`Giá đấu phải tối thiểu ${formatNumberDisplay(minBid)} đ`);
      return;
    }

    try {
      setIsLoading(true);
      await placeBid(bidValue);
      // Clear input on successful submission
      setBidValue("");
      setDisplayValue("");
      setError("");
      setSuggestions([]);
    } catch (err) {
      setError(err?.message || "Đặt giá thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Disable decrement if at minimum bid
  const isDecrementDisabled = bidValue <= minBid || bidValue === 0;
  // Disable submit if error exists or value is invalid
  const isSubmitDisabled = error !== "" || bidValue < minBid || bidValue === 0 || isLoading;

  return (
    <div className="space-y-4">
      {/* Bid Input Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Decrement Button */}
          <button
            onClick={handleDecrement}
            disabled={isDecrementDisabled}
            className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
              isDecrementDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title="Giảm giá đấu"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Number Input */}
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              placeholder={`Tối thiểu: ${formatNumberDisplay(minBid)}`}
              value={displayValue}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-center text-xl font-bold rounded-md border-2 transition-colors ${
                error
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white hover:border-gray-400 focus:border-primary focus:outline-none"
              }`}
            />
          </div>

          {/* Increment Button */}
          <button
            onClick={handleIncrement}
            className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            title="Tăng giá đấu"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>

        {/* Bid Step Info */}
        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span>Bước giá: {formatNumberDisplay(sanitizedStepPrice)} đ</span>
          <span>Tối thiểu: {formatNumberDisplay(minBid)} đ</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-3 py-2 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            Giá gợi ý hợp lệ:
          </p>
          <div className="flex gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => applySuggestion(suggestion.value)}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-md border-2 border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                {suggestion.label} đ
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmitBid}
        disabled={isSubmitDisabled}
        className={`w-full h-10 font-bold text-white rounded-md transition-colors ${
          isSubmitDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        {isLoading ? "Đang xử lý..." : "Đặt giá"}
      </Button>
    </div>
  );
}
