import string

alphabet = string.ascii_lowercase+' '+','+'.'

combinaisons = [ a + b for a in string.ascii_lowercase+' '+','+'.' for b in string.ascii_lowercase+' '+','+'.']

def extract_text_from_pdf(pdf_path):
    import fitz

    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    text=text.lower()
    return ''.join(c for c in text if c in alphabet)

def extract_text_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    text = text.lower()
    return ''.join(c for c in text if c in alphabet)

def get_letter_frequencies(text):
    size_text = len(text)
    letter_frequencies = {letter: 0 for letter in alphabet}
    for i in range(len(text) - 1):
        if text[i] in letter_frequencies:
            letter_frequencies[text[i]] += 1
    for letter in letter_frequencies:
        letter_frequencies[letter] = letter_frequencies[letter]*100/ size_text
    return letter_frequencies

def get_combination_frequencies(text):
    size_text = len(text)
    combination_frequencies = {comb: 0 for comb in combinaisons}
    total_combinations = 0
    for i in range(len(text) - 1):
        comb = text[i:i+2]
        if comb in combination_frequencies:
            combination_frequencies[comb] += 1
            total_combinations += 1
    for comb in combination_frequencies:
        combination_frequencies[comb] = combination_frequencies[comb] * 100 / total_combinations
    return combination_frequencies