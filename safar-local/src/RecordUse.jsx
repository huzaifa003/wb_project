import React from 'react';
export default function RecordUse({conversation}){
 return <section className="record-use" aria-label="Conversation storage"><strong>{conversation?'Saved on this device':'Your words stay on this device'}</strong><p>{conversation?'This conversation is included in your records and insights. Read the original words before making decisions.':'Ask visitors before saving their words. Every conversation is saved locally and included in your insights.'}</p>{conversation?.demo&&<p>This is a fictional sample conversation.</p>}<small>No automatic model training or transcript upload occurs.</small></section>;
}
