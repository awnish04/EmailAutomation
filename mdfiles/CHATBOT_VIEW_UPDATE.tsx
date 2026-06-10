      {/* Chatbot Wizard View - Conversational + Form */}
      {activeView === 'chatbot' && (
        <div className="flex-1 flex">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {wizardMessages.map((message, index) => (
                  <div key={index}>
                    {/* Message Bubble */}
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-2xl ${
                          message.role === 'user'
                            ? 'bg-green-600 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white text-neutral-900 rounded-2xl rounded-tl-sm shadow-md border border-neutral-200'
                        } px-6 py-4`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-neutral-700">AI Agent</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-green-100' : 'text-neutral-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {wizardLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-neutral-900 rounded-2xl rounded-tl-sm shadow-md border border-neutral-200 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-neutral-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-neutral-200 bg-white p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleWizardChatMessage(inputValue)
                      }
                    }}
                    placeholder='Type your message... (e.g., "Find 100 leads in California")'
                    className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:border-green-500 text-sm"
                    disabled={wizardLoading}
                  />
                  <button
                    onClick={() => handleWizardChatMessage(inputValue)}
                    disabled={!inputValue.trim() || wizardLoading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-neutral-300 text-white rounded-xl transition-all flex items-center gap-2 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </button>
                </div>
                <p className="text-xs text-neutral-500 text-center mt-2">
                  Press Enter to send • AI will extract campaign details automatically
                </p>
              </div>
            </div>
          </div>

          {/* Middle Campaign Form (Shows when AI extracts data) */}
          {showCampaignForm && (
            <div className="w-96 border-l border-neutral-200 bg-white shadow-xl p-6 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Campaign Details
                </h2>
                <p className="text-sm text-neutral-600">Review and confirm your campaign</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Service */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Service / Product
                  </label>
                  <div className="space-y-2">
                    {campaignData.service && (
                      <div className="px-4 py-2 bg-green-50 border-2 border-green-500 rounded-lg text-sm font-medium text-green-700">
                        ✓ {campaignData.service}
                      </div>
                    )}
                    <input
                      type="text"
                      value={customInput.service}
                      onChange={(e) => setCustomInput(prev => ({ ...prev, service: e.target.value }))}
                      placeholder="Or type custom service..."
                      className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Target Audience
                  </label>
                  <div className="space-y-2">
                    {campaignData.targetAudience && (
                      <div className="px-4 py-2 bg-green-50 border-2 border-green-500 rounded-lg text-sm font-medium text-green-700">
                        ✓ {campaignData.targetAudience}
                      </div>
                    )}
                    <input
                      type="text"
                      value={customInput.targetAudience}
                      onChange={(e) => setCustomInput(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="Or type custom audience..."
                      className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Location
                  </label>
                  <div className="space-y-2">
                    {campaignData.location && (
                      <div className="px-4 py-2 bg-green-50 border-2 border-green-500 rounded-lg text-sm font-medium text-green-700">
                        ✓ {campaignData.location}
                      </div>
                    )}
                    <input
                      type="text"
                      value={customInput.location}
                      onChange={(e) => setCustomInput(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Or type custom location..."
                      className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                    />
                  </div>
                </div>

                {/* Email Count */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Number of Emails
                  </label>
                  <div className="space-y-2">
                    {campaignData.emailCount && (
                      <div className="px-4 py-2 bg-green-50 border-2 border-green-500 rounded-lg text-sm font-medium text-green-700">
                        ✓ {campaignData.emailCount}
                      </div>
                    )}
                    <input
                      type="number"
                      value={customInput.emailCount}
                      onChange={(e) => setCustomInput(prev => ({ ...prev, emailCount: e.target.value }))}
                      placeholder="Or type custom count..."
                      className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-sm font-bold text-blue-900 mb-2">📊 Campaign Summary</h3>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Service: <strong>{campaignData.service || customInput.service || 'Not set'}</strong></p>
                  <p>• Target: <strong>{campaignData.targetAudience || customInput.targetAudience || 'Not set'}</strong></p>
                  <p>• Location: <strong>{campaignData.location || customInput.location || 'Not set'}</strong></p>
                  <p>• Emails: <strong>{campaignData.emailCount || customInput.emailCount || 'Not set'}</strong></p>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmCampaign}
                disabled={wizardLoading || (!campaignData.service && !customInput.service)}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-neutral-300 disabled:to-neutral-400 text-white rounded-xl transition-all font-bold text-base shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm & Start Campaign
              </button>
            </div>
          )}

          {/* Right Sidebar - Progress */}
          <aside className="w-80 border-l border-neutral-200 bg-white shadow-xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Setup Progress
              </h2>
              <p className="text-sm text-neutral-600">Chat with AI to setup campaign</p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${campaignData.service || customInput.service ? 'bg-green-50 border-2 border-green-500' : 'bg-neutral-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${campaignData.service || customInput.service ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'}`}>
                  {campaignData.service || customInput.service ? '✓' : '1'}
                </div>
                <span className="text-sm font-medium">Service</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${campaignData.targetAudience || customInput.targetAudience ? 'bg-green-50 border-2 border-green-500' : 'bg-neutral-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${campaignData.targetAudience || customInput.targetAudience ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'}`}>
                  {campaignData.targetAudience || customInput.targetAudience ? '✓' : '2'}
                </div>
                <span className="text-sm font-medium">Target Audience</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${campaignData.location || customInput.location ? 'bg-green-50 border-2 border-green-500' : 'bg-neutral-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${campaignData.location || customInput.location ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'}`}>
                  {campaignData.location || customInput.location ? '✓' : '3'}
                </div>
                <span className="text-sm font-medium">Location</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${campaignData.emailCount || customInput.emailCount ? 'bg-green-50 border-2 border-green-500' : 'bg-neutral-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${campaignData.emailCount || customInput.emailCount ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'}`}>
                  {campaignData.emailCount || customInput.emailCount ? '✓' : '4'}
                </div>
                <span className="text-sm font-medium">Email Count</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${showCampaignForm ? 'bg-green-50 border-2 border-green-500' : 'bg-neutral-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showCampaignForm ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'}`}>
                  ✓
                </div>
                <span className="text-sm font-medium">Confirm</span>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-green-900 mb-1">How it works</h3>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Chat naturally with the AI. It will extract campaign details automatically and show them in the middle form. You can edit or add custom values before confirming.
                  </p>
                </div>
              </div>
            </div>

            {/* Show Form Button */}
            {!showCampaignForm && wizardMessages.length > 2 && (
              <button
                onClick={() => setShowCampaignForm(true)}
                className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Review Campaign
              </button>
            )}
          </aside>
        </div>
      )}
