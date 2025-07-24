import json

def hindi_correction_prompt(chunk: str) -> str:
    """
    Returns a prompt for correcting Hindi transcription errors, including spelling, spacing, punctuation,
    and transliterated English words, while preserving speaker labels and cultural tone.
    """
    return f"""
You are a Hindi language expert with a deep understanding of transcription, conversational nuances, and respectful language handling.

You have been given a raw transcription of a Hindi conversation. This text may include:
- Spelling or typographical errors (e.g., "आमाद" instead of "आमद")
- Words that are joined together without spaces (e.g., "मैंनानसी")
- Words that are incorrectly split (e.g., "अ स्थि" instead of "अस्थि")
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

def translation_prompt(chunk: str) -> str:
    """
    Returns a prompt for translating Hindi (Devanagari) text to natural, fluent English, preserving tone and speaker formatting.
    """
    return f"""
You are a professional Hindi-English translator.

Translate the following Hindi (Devanagari) text into natural, fluent English while preserving the tone and speaker formatting.

Hindi Text:
\"\"\"{chunk}\"\"\"

English Translation:
"""

def sales_call_analysis_prompt(prompts, transcript: str) -> str:
    """
    Returns a prompt for analyzing a sales call transcript, instructing the model to infer speakers and
    provide a detailed, structured JSON analysis. The prompts argument is included in the output JSON.
    """

    prompts_str = json.dumps(prompts, ensure_ascii=False, indent=2) if not isinstance(prompts, str) else prompts
    return f"""
You are an expert in analyzing sales call transcripts.

You are provided with a transcript of a conversation between a QHT Clinic salesperson and a prospective client. The speakers are not labeled. You must:

---

**Task 1**: Infer the speakers based on the content and context.

**Task 2**: Critically evaluate the salesperson's performance using the following JSON structure. All feedback must be highly specific, contextually relevant, and constructive.

---

**Instructions**: Populate each key with your analysis. Return only the resulting JSON object with no additional explanation.

Return your analysis in this exact JSON format:

{json.dumps(prompts_str)}

Transcript: {transcript}"""
