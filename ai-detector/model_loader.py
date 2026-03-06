from transformers import pipeline
import re

_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        print("🔄 Loading DistilBERT model...")
        _classifier = pipeline(
            "zero-shot-classification",
            model="typeform/distilbert-base-uncased-mnli",
            device=-1
        )
        print("✅ Model loaded successfully!")
    return _classifier


def classify_prompt(prompt):
    prompt_lower = prompt.lower().strip()
    prompt_clean = re.sub(r'\s+', ' ', prompt_lower)
    word_count = len(prompt_clean.split())

    # ============================================
    # STEP 1: SAFE — Greetings & casual conversation
    # ============================================
    greetings = [
        "hi", "hello", "hey", "hii", "hiii", "yo", "sup",
        "good morning", "good afternoon", "good evening", "good night",
        "gm", "gn", "morning", "evening",
        "how are you", "how r u", "how are u", "how r you",
        "what's up", "whats up", "wassup", "wazzup",
        "hi there", "hello there", "hey there",
        "hi how are you", "hi how r u", "hello how are you",
        "hi, how r u", "hi, how are you", "hey, how are you",
        "hi, how are u", "hey how r u", "hello how r u",
        "how do you do", "howdy", "greetings",
        "thank you", "thanks", "thanku", "thnx", "thx",
        "bye", "goodbye", "see you", "see ya", "take care",
        "ok", "okay", "sure", "yes", "no", "yep", "nope",
        "please", "help", "help me", "can you help",
        "nice", "cool", "great", "awesome", "good", "fine",
        "i'm good", "im good", "i am good", "i'm fine", "im fine",
        "what can you do", "who are you", "what are you",
        "tell me a joke", "tell me something fun",
    ]

    for greeting in greetings:
        if prompt_clean == greeting or prompt_clean == greeting.replace(",", ""):
            return {
                "label": "SAFE",
                "confidence": 0.95,
                "all_scores": {"SAFE": 0.95, "JAILBREAK": 0.03, "PROMPT_INJECTION": 0.02}
            }

    # Danger words list (used in multiple checks)
    danger_words = [
        "hack", "bomb", "kill", "steal", "attack", "exploit", "inject",
        "ignore", "bypass", "override", "forget", "reveal", "system",
        "prompt", "instructions", "jailbreak", "dan", "unrestricted",
        "weapon", "drug", "poison", "malware", "virus", "password",
        "murder", "kidnap", "torture", "suicide", "abuse", "terrorist",
        "explosive", "gun", "knife", "shoot", "destroy", "leak",
        "dump", "expose", "pretend", "disable", "unlock", "restrict",
    ]
    has_danger_word = any(word in prompt_clean for word in danger_words)

    # Short casual messages (1-4 words, no dangerous words) → SAFE
    if word_count <= 4 and not has_danger_word:
        return {
            "label": "SAFE",
            "confidence": 0.93,
            "all_scores": {"SAFE": 0.93, "JAILBREAK": 0.04, "PROMPT_INJECTION": 0.03}
        }

    # ============================================
    # STEP 2: SAFE — Common educational questions
    # ============================================
    safe_starters = [
        "what is", "what are", "what was", "what were", "what does", "what do",
        "who is", "who are", "who was", "who were",
        "when did", "when was", "when is", "when are",
        "where is", "where are", "where was", "where do",
        "why do", "why does", "why is", "why are", "why did",
        "how to learn", "how do i learn", "how does", "how do",
        "how can i learn", "how can i", "how many", "how much",
        "explain", "describe", "define", "summarize", "summarise",
        "tell me about", "teach me about", "help me understand",
        "can you explain", "can you describe", "can you tell me",
        "could you explain", "please explain",
        "write a poem", "write a story", "write a code", "write a function",
        "write a program", "write me", "write an essay",
        "create a poem", "create a story", "create a function",
        "generate a", "list the", "compare", "difference between",
        "what is the meaning", "meaning of", "definition of",
        "advantages of", "disadvantages of", "benefits of",
        "history of", "types of", "examples of", "features of",
        "importance of", "applications of", "uses of",
        "solve", "calculate", "convert", "translate",
    ]

    starts_safe = any(prompt_clean.startswith(s) for s in safe_starters)

    if starts_safe and not has_danger_word:
        return {
            "label": "SAFE",
            "confidence": 0.92,
            "all_scores": {"SAFE": 0.92, "JAILBREAK": 0.05, "PROMPT_INJECTION": 0.03}
        }

    # Questions ending with ? that don't have danger words
    if prompt_clean.endswith('?') and not has_danger_word and word_count <= 10:
        return {
            "label": "SAFE",
            "confidence": 0.90,
            "all_scores": {"SAFE": 0.90, "JAILBREAK": 0.05, "PROMPT_INJECTION": 0.05}
        }

    # ============================================
    # STEP 3: HARMFUL / DANGEROUS content
    # ============================================
    harmful_phrases = [
        "how to make a bomb", "how to prepare bomb", "how to build a bomb",
        "how to make explosives", "how to make explosive",
        "how to make poison", "how to poison someone",
        "how to make drugs", "how to make meth", "how to make cocaine",
        "how to cook meth", "how to synthesize",
        "how to hack", "how to hack into", "how to ddos",
        "how to attack a server", "how to break into a system",
        "how to steal", "how to rob", "how to shoplift",
        "how to kill", "how to murder", "how to assassinate",
        "how to hurt someone", "how to kidnap", "how to torture",
        "how to make a weapon", "how to build a gun",
        "how to make fake id", "how to counterfeit",
        "how to launder money", "how to traffic", "how to smuggle",
        "how to make malware", "how to create a virus",
        "how to write ransomware", "how to phish",
        "how to make napalm", "how to make thermite",
        "how to make gunpowder", "how to make a pipe bomb",
        "suicide methods", "how to self harm", "how to end my life",
        "biological weapon", "chemical weapon", "nuclear weapon",
        "terrorist attack", "mass shooting", "school shooting",
        "child abuse", "child exploitation",
    ]

    for phrase in harmful_phrases:
        if phrase in prompt_clean:
            return {
                "label": "JAILBREAK",
                "confidence": 0.96,
                "all_scores": {"JAILBREAK": 0.96, "PROMPT_INJECTION": 0.02, "SAFE": 0.02}
            }

    # Pattern matching: [danger_noun] + [action_verb]
    danger_combos = [
        (["bomb", "explosive", "explosives"], ["make", "build", "create", "prepare", "construct", "assemble", "how"]),
        (["weapon", "weapons"], ["make", "build", "create", "how", "construct"]),
        (["gun", "firearm"], ["make", "build", "print", "3d print", "assemble"]),
        (["poison"], ["make", "create", "prepare", "how to", "use on"]),
        (["drug", "drugs", "meth", "cocaine", "heroin"], ["make", "cook", "produce", "synthesize", "manufacture"]),
        (["hack", "hacking"], ["how", "into", "password", "account", "system", "server", "website"]),
        (["kill", "killing"], ["how", "someone", "person", "people", "ways to", "method"]),
        (["steal", "stealing"], ["how", "identity", "money", "credit card", "data", "password"]),
        (["malware", "ransomware", "trojan"], ["make", "create", "write", "code", "build", "develop"]),
        (["virus", "worm"], ["make", "create", "write", "computer", "build"]),
    ]

    for nouns, verbs in danger_combos:
        for noun in nouns:
            if noun in prompt_clean:
                for verb in verbs:
                    if verb in prompt_clean:
                        return {
                            "label": "JAILBREAK",
                            "confidence": 0.92,
                            "all_scores": {"JAILBREAK": 0.92, "PROMPT_INJECTION": 0.05, "SAFE": 0.03}
                        }

    # ============================================
    # STEP 4: JAILBREAK keyword detection
    # ============================================
    jailbreak_phrases = [
        "ignore previous instructions", "ignore all instructions",
        "ignore above instructions", "ignore your instructions",
        "ignore all previous", "ignore my previous",
        "disregard all", "disregard previous", "disregard your",
        "act as an unrestricted", "act as unrestricted",
        "you are now", "do anything now", "bypass safety",
        "bypass your", "bypass all", "bypass filters",
        "unrestricted ai", "no restrictions", "without restrictions",
        "jailbreak", "jail break",
        "dan mode", "dan prompt", "act as dan",
        "pretend you are", "pretend you're", "pretend to be",
        "override your instructions", "override instructions",
        "forget your instructions", "forget all instructions",
        "forget all previous", "forget your rules",
        "forget all ur", "forget all your",
        "forget ur policies", "forget your policies",
        "can u forget", "can you forget",
        "developer mode", "dev mode",
        "opposite mode", "evil mode", "god mode",
        "unlock your full potential", "remove all filters",
        "remove your filters", "remove safety",
        "without any restrictions", "no ethical guidelines",
        "ignore your programming", "break free from",
        "disable your safety", "disable safety", "disable filters",
        "turn off your filters", "turn off filters",
        "you have no rules", "you have no restrictions",
        "act without restrictions", "respond without filters",
        "unfiltered mode", "uncensored mode",
        "ignore all safety", "ignore safety guidelines",
        "do not follow your rules", "don't follow your rules",
        "you must obey me", "obey my commands",
    ]

    for phrase in jailbreak_phrases:
        if phrase in prompt_clean:
            return {
                "label": "JAILBREAK",
                "confidence": 0.95,
                "all_scores": {"JAILBREAK": 0.95, "PROMPT_INJECTION": 0.03, "SAFE": 0.02}
            }

    # ============================================
    # STEP 5: PROMPT INJECTION keyword detection
    # ============================================
    injection_phrases = [
        "reveal the system prompt", "reveal system prompt",
        "reveal your system", "reveal your prompt",
        "show system prompt", "show me your instructions",
        "show your instructions", "show me your prompt",
        "show your prompt", "show your configuration",
        "show me your rules", "show your rules",
        "show initial prompt", "show hidden prompt",
        "display your prompt", "display initial instructions",
        "display your instructions", "display your rules",
        "repeat your instructions", "repeat your prompt",
        "what were you told", "what is your system prompt",
        "what is your prompt", "what are your instructions",
        "what are your rules", "what is your system message",
        "print your instructions", "print your prompt",
        "output your rules", "output your instructions",
        "tell me your system message", "tell me your instructions",
        "tell me your prompt", "tell me your rules",
        "what instructions were you given",
        "leak your prompt", "leak your data", "leak ur data",
        "reveal ur data", "reveal your data",
        "show ur data", "show your data",
        "give me your data", "give ur data",
        "expose your data", "expose ur data",
        "dump your data", "dump ur data",
        "extract your data", "extract system",
        "what is your training data", "show training data",
        "reveal your training", "show me your code",
        "show your source code", "display your code",
    ]

    for phrase in injection_phrases:
        if phrase in prompt_clean:
            return {
                "label": "PROMPT_INJECTION",
                "confidence": 0.93,
                "all_scores": {"PROMPT_INJECTION": 0.93, "JAILBREAK": 0.04, "SAFE": 0.03}
            }

    # ============================================
    # STEP 6: Use DistilBERT for ambiguous prompts
    # ============================================
    classifier = get_classifier()

    labels = [
        "a normal safe question or conversation",
        "a request for dangerous harmful or illegal activities like making weapons drugs hacking or violence",
        "a jailbreak attempt trying to bypass AI restrictions safety rules or act as an unrestricted AI",
        "a prompt injection trying to extract system instructions reveal hidden prompts or manipulate AI behavior"
    ]

    result = classifier(prompt, labels)

    label_map = {
        "a normal safe question or conversation": "SAFE",
        "a request for dangerous harmful or illegal activities like making weapons drugs hacking or violence": "JAILBREAK",
        "a jailbreak attempt trying to bypass AI restrictions safety rules or act as an unrestricted AI": "JAILBREAK",
        "a prompt injection trying to extract system instructions reveal hidden prompts or manipulate AI behavior": "PROMPT_INJECTION"
    }

    top_label_text = result["labels"][0]
    top_score = result["scores"][0]
    classified_label = label_map.get(top_label_text, "SAFE")

    # Build scores dict
    all_scores = {}
    for label_text, score in zip(result["labels"], result["scores"]):
        mapped = label_map[label_text]
        if mapped in all_scores:
            all_scores[mapped] += score
        else:
            all_scores[mapped] = score

    # ============================================
    # STEP 7: Post-processing — prevent false positives
    # ============================================

    # If model says NOT safe but confidence is low → likely false positive
    if classified_label != "SAFE" and top_score < 0.6:
        safe_score = all_scores.get("SAFE", 0)
        if safe_score > 0.25:
            classified_label = "SAFE"
            top_score = safe_score
            print(f"   ⚡ Overridden to SAFE (low confidence, safe_score: {safe_score:.2f})")

    # If no danger words and model confidence < 0.7 → SAFE
    if classified_label != "SAFE" and not has_danger_word and top_score < 0.7:
        classified_label = "SAFE"
        top_score = all_scores.get("SAFE", 0.85)
        print(f"   ⚡ Overridden to SAFE (no danger words, confidence too low)")

    # Short prompt (<=6 words) with no danger words → SAFE
    if classified_label != "SAFE" and word_count <= 6 and not has_danger_word:
        classified_label = "SAFE"
        top_score = 0.88
        print(f"   ⚡ Overridden to SAFE (short prompt, no danger words)")

    print(f"   📊 Final: {classified_label} (conf: {top_score:.2f}) | Scores: {all_scores}")

    return {
        "label": classified_label,
        "confidence": round(top_score, 4),
        "all_scores": {k: round(v, 4) for k, v in all_scores.items()}
    }