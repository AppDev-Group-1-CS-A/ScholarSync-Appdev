"use client";

import { Loader2 } from "lucide-react";

const LoadingOverlay = () => {
  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper bg-white">
        <div className="loading-shadow">
          <Loader2 className="loading-animation w-12 h-12 text-[#663820]" />
          <h2 className="loading-title">Processing Your Book</h2>
          <div className="loading-progress">
            <div className="loading-progress-item">
              <div className="loading-progress-status"></div>
              <span>Uploading PDF...</span>
            </div>
            <div className="loading-progress-item">
              <div className="loading-progress-status"></div>
              <span>Extracting text...</span>
            </div>
            <div className="loading-progress-item">
              <div className="loading-progress-status"></div>
              <span>Generating audio...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
