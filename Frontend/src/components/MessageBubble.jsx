import RiskIndicator from './RiskIndicator';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  const getBadge = (action) => {
    switch (action) {
      case 'BLOCKED': return { style: 'bg-red-500/10 text-red-400 border border-red-500/30', icon: '🚫' };
      case 'SANITIZED': return { style: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30', icon: '⚠️' };
      case 'ALLOWED': return { style: 'bg-green-500/10 text-green-400 border border-green-500/30', icon: '✅' };
      default: return { style: 'bg-gray-500/10 text-gray-400', icon: '💬' };
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 animate-fade-in-up`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm flex-shrink-0 mr-3 shadow-lg shadow-emerald-500/20">
          🛡️
        </div>
      )}

      <div className={`max-w-[70%]`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-5 py-3.5 ${
            isUser
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-md shadow-lg shadow-cyan-500/15'
              : 'glass text-gray-200 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Metadata Card */}
        {!isUser && message.meta && (
          <div className="mt-2.5 p-3.5 glass rounded-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const badge = getBadge(message.meta.action);
                return (
                  <span className={`text-[11px] px-3 py-1 rounded-full font-bold ${badge.style}`}>
                    {badge.icon} {message.meta.action}
                  </span>
                );
              })()}
              <span className="text-[10px] text-gray-600 ml-auto">
                {new Date(message.meta.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <RiskIndicator riskScore={message.meta.riskScore} label={message.meta.label} confidence={message.meta.confidence} />
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm flex-shrink-0 ml-3 shadow-lg shadow-blue-500/20">
          👤
        </div>
      )}
    </div>
  );
};

export default MessageBubble;