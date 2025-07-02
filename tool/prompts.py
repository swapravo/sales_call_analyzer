def hindi_correction_prompt(chunk):
    return f"""
You are a Hindi language expert with a deep understanding of transcription, conversational nuances, and respectful language handling.

You have been given a raw transcription of a Hindi conversation. This text may include:
- Spelling or typographical errors (e.g., "आमाद" instead of "आमद")
- Words that are joined together without spaces (e.g., "मैंनानसी")
- Words that ar
e incorrectly split (e.g., "अ स्थि" instead of "अस्थि")
- Punctuation and formatting inconsistencies
- Instances of English words written in Devanagari script due to transliteration (e.g., "ड्राफ्ट", "क्लिनिक", "ट्रांसप्लांट")

Your task is to:
- Gently correct spelling, spacing, and punctuation, ensuring the readability and natural flow of the conversation
- Thoughtfully identify transliterated English words written in Devanagari script and replace them with their correct English spelling (e.g., "क्लिनिक" → "clinic"), only where appropriate and commonly understood
- Retain the overall structure, intent, and cultural tone of the conversation
- Maintain the speaker-label format as it appears (e.g.,  
  Speaker 1: ...  
  Speaker 2: ...)

Do **not** translate the conversation into English.  
Do **not** alter or rename the speaker labels.  
Be respectful and mindful of cultural context—avoid overcorrecting informal or colloquial language unless it disrupts clarity.

Raw Conversation:
\"\"\"{chunk}\"\"\"

Cleaned and culturally sensitive version (with thoughtful handling of transliterated terms):
"""

def translation_prompt(chunk):
    return f"""
You are a professional Hindi-English translator.

Translate the following Hindi (Devanagari) text into natural, fluent English while preserving the tone and speaker formatting.

Hindi Text:
\"\"\"{chunk}\"\"\"

English Translation:
"""

def sales_call_analysis_prompt(transcript):
    return f"""
You are an expert in analyzing sales call transcripts.

You are provided with a transcript of a conversation between a QHT Clinic salesperson and a prospective client. The speakers are not labeled. You must:

---

**Task 1**: Infer the speakers based on the content and context.

**Task 2**: Critically evaluate the salesperson's performance using the following JSON structure. All feedback must be highly specific, contextually relevant, and constructive.

---

**Instructions**: Populate each key with your analysis. Return only the resulting JSON object with no additional explanation.

Return your analysis in this exact JSON format:

{{
  "pitch_followed_analysis": "Explain how well the salesperson followed a structured pitch, demonstrated knowledge of QHT's procedure, and conveyed benefits clearly.",
  "pitch_followed_positive_example": "Quote one effective line from the salesperson and explain why it was good.",
  "pitch_followed_negative_example": "Quote one ineffective line and explain why it was weak.",
  "pitch_followed_suggestions": "Provide at least two alternative sentences the salesperson could have said to improve clarity or pitch structure.",
  
  "confidence_analysis": "Assess how confidently the salesperson responded to queries, addressed objections, and conveyed authority.",
  "confidence_positive_example": "Quote and explain one confident line.",
  "confidence_negative_example": "Quote and explain one hesitant or unclear line.",
  "confidence_suggestions": "Provide two or more confident, reassuring sentences the salesperson could have used.",
  
  "tonality_analysis": "Evaluate the salesperson's tone — empathy, professionalism, warmth, adaptability to customer's mood.",
  "tonality_positive_example": "Quote and explain a good tone moment.",
  "tonality_negative_example": "Quote and explain a tone misstep.",
  "tonality_suggestions": "Suggest better-toned alternatives that would have improved engagement.",
  
  "energy_analysis": "Examine the level of enthusiasm shown and whether it was maintained throughout the call.",
  "energy_positive_example": "Quote a sentence that reflected strong energy.",
  "energy_negative_example": "Quote a sentence that lacked enthusiasm.",
  "energy_suggestions": "Suggest phrases that convey excitement and motivation tailored to this transcript.",
  
  "objection_handling_analysis": "Analyze how well objections (e.g., cost, pain, recovery) were handled — clarity, empathy, and resolution.",
  "objection_handling_positive_example": "Quote an example where an objection was well addressed.",
  "objection_handling_negative_example": "Quote a poor handling of an objection.",
  "objection_handling_suggestions": "Suggest alternative responses that would better resolve common objections.",
  
  "strengths": "Summarize major strengths with specific examples.",
  "areas_for_improvement": "Highlight weaknesses and suggest what to improve.",
  
  "pitch_followed_score": [Integer 1–10],
  "confidence_score": [Integer 1–10],
  "tonality_score": [Integer 1–10],
  "energy_score": [Integer 1–10],
  "objection_handling_score": [Integer 1–10],
  "overall_score": [Average of the above 5 scores, rounded to 1 decimal]
}}

Transcript:
\"\"\"{transcript}\"\"\"
"""
