export function reviewTranslation(message,text,checked,now=new Date().toISOString()){
 const corrected=String(text).trim();
 if(!checked)throw new Error('Check the meaning with the speaker first.');
 if(!corrected||corrected.length>2000)throw new Error('Enter a translation of 1–2,000 characters.');
 if(message.translation_status==='pending')throw new Error('Wait for translation to finish first.');
 return {...message,translated_text:corrected,translation_status:'reviewed',translation_error:null,
  translation_review:{checkedWithSpeaker:true,reviewedAt:now,previousText:message.translation_review?message.translation_review.previousText:message.translated_text??null,previousStatus:message.translation_review?.previousStatus??message.translation_status}};
}
