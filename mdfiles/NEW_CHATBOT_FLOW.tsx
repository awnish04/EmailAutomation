      {/* New Chatbot Flow - Single Chat + Setup Panel */}
      {activeView === 'chatbot' && (
        <div className="flex-1 flex">
          {/* Main Chat Area (Left) */}
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

                {/* Start Campaign Button */}
                {showStartButton && !campaignStarted && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleStartCampaign}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-bold text-lg shadow-lg flex items-center gap-3"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      🚀 Yes, start campaign!
                    </button>
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
                    disabled={wizardLoading || campaignStarted}
                  />
                  <button
                    onClick={() => handleWizardChatMessage(inputValue)}
                    disabled={!inputValue.trim() || wizardLoading || campaignStarted}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-neutral-300 text-white rounded-xl transition-all flex items-center gap-2 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </button>
                </div>
                <p className="text-xs text-neutral-500 text-center mt-2">
                  Press Enter to send • AI will guide you through setup
                </p>
              </div>
            </div>
          </div>

          {/* Setup Progress Panel (Right) - Shows after initial chat */}
          {showSetupPanel && !campaignStarted && (
            <aside className="w-96 border-l border-neutral-200 bg-white shadow-xl p-6 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Setup Progress
                </h2>
                <p className="text-sm text-neutral-600">Follow the steps to create your campaign</p>
              </div>

              {/* Progress Steps - Clickable */}
              <div className="space-y-3">
                {/* Purpose Step */}
                <button
                  onClick={() => handleStepClick('purpose')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    campaignData.purpose 
                      ? 'bg-green-50 border-2 border-green-500' 
                      : 'bg-neutral-50 border-2 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    campaignData.purpose ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'
                  }`}>
                    {campaignData.purpose ? '✓' : '1'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-neutral-900">Purpose</div>
                    {campaignData.purpose && (
                      <div className="text-xs text-green-700 mt-1">{campaignData.purpose}</div>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedStepDetail === 'purpose' ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'} />
                  </svg>
                </button>

                {/* Purpose Detail Panel */}
                {selectedStepDetail === 'purpose' && (
                  <div className="ml-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-700 mb-3">What do you want to do?</p>
                    <div className="space-y-2">
                      {['Find Leads', 'Send Emails', 'Generate Leads'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSetupOptionClick('purpose', option)}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            campaignData.purpose === option
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-neutral-300 text-neutral-700 hover:border-green-500'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Step */}
                <button
                  onClick={() => handleStepClick('service')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    campaignData.service 
                      ? 'bg-green-50 border-2 border-green-500' 
                      : 'bg-neutral-50 border-2 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    campaignData.service ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'
                  }`}>
                    {campaignData.service ? '✓' : '2'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-neutral-900">Service</div>
                    {campaignData.service && (
                      <div className="text-xs text-green-700 mt-1">{campaignData.service}</div>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedStepDetail === 'service' ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'} />
                  </svg>
                </button>

                {/* Service Detail Panel */}
                {selectedStepDetail === 'service' && (
                  <div className="ml-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-700 mb-3">What service do you offer?</p>
                    <div className="space-y-2">
                      {['Real Estate', 'SaaS', 'Marketing', 'Consulting'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSetupOptionClick('service', option)}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            campaignData.service === option
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-neutral-300 text-neutral-700 hover:border-green-500'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audience Step */}
                <button
                  onClick={() => handleStepClick('targetAudience')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    campaignData.targetAudience 
                      ? 'bg-green-50 border-2 border-green-500' 
                      : 'bg-neutral-50 border-2 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    campaignData.targetAudience ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'
                  }`}>
                    {campaignData.targetAudience ? '✓' : '3'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-neutral-900">Target Audience</div>
                    {campaignData.targetAudience && (
                      <div className="text-xs text-green-700 mt-1">{campaignData.targetAudience}</div>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedStepDetail === 'targetAudience' ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'} />
                  </svg>
                </button>

                {/* Target Detail Panel */}
                {selectedStepDetail === 'targetAudience' && (
                  <div className="ml-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-700 mb-3">Who is your target audience?</p>
                    <div className="space-y-2">
                      {['Real Estate Agents', 'SaaS Founders', 'Small Business Owners', 'Developers'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSetupOptionClick('targetAudience', option)}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            campaignData.targetAudience === option
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-neutral-300 text-neutral-700 hover:border-green-500'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Step */}
                <button
                  onClick={() => handleStepClick('location')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    campaignData.location 
                      ? 'bg-green-50 border-2 border-green-500' 
                      : 'bg-neutral-50 border-2 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    campaignData.location ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'
                  }`}>
                    {campaignData.location ? '✓' : '4'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-neutral-900">Location</div>
                    {campaignData.location && (
                      <div className="text-xs text-green-700 mt-1">{campaignData.location}</div>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedStepDetail === 'location' ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'} />
                  </svg>
                </button>

                {/* Location Detail Panel */}
                {selectedStepDetail === 'location' && (
                  <div className="ml-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-700 mb-3">Where are they located?</p>
                    <div className="space-y-2">
                      {['New York', 'California', 'Kathmandu', 'United States'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSetupOptionClick('location', option)}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            campaignData.location === option
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-neutral-300 text-neutral-700 hover:border-green-500'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Count Step */}
                <button
                  onClick={() => handleStepClick('emailCount')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    campaignData.emailCount 
                      ? 'bg-green-50 border-2 border-green-500' 
                      : 'bg-neutral-50 border-2 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    campaignData.emailCount ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'
                  }`}>
                    {campaignData.emailCount ? '✓' : '5'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-neutral-900">Email Count</div>
                    {campaignData.emailCount && (
                      <div className="text-xs text-green-700 mt-1">{campaignData.emailCount} emails</div>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedStepDetail === 'emailCount' ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'} />
                  </svg>
                </button>

                {/* Email Count Detail Panel */}
                {selectedStepDetail === 'emailCount' && (
                  <div className="ml-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-700 mb-3">How many emails?</p>
                    <div className="space-y-2">
                      {['50', '100', '200', '500'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSetupOptionClick('emailCount', option)}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            campaignData.emailCount === option
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-neutral-300 text-neutral-700 hover:border-green-500'
                          }`}
                        >
                          {option} emails
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm Step */}
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                  showStartButton 
                    ? 'bg-green-50 border-2 border-green-500' 
                    : 'bg-neutral-50 border-2 border-neutral-200'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    showStartButton ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'
                  }`}>
                    ✓
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-neutral-900">Confirm</div>
                    {showStartButton && (
                      <div className="text-xs text-green-700 mt-1">Ready to start!</div>
                    )}
                  </div>
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
                      Answer each question by clicking an option. The AI will guide you through creating your marketing campaign step by step. Click on any step to see or change details.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}
