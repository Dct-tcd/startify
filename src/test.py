import PyPDF2
from docx import Document

def pdf_to_word(pdf_path, word_path):
    # Create a Document object
    doc = Document()

    # Open the PDF file
    with open(pdf_path, "rb") as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)

        # Loop through each page
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text = page.extract_text()

            if text:  # If text exists on the page
                # Keep as normal paragraph (not word by word)
                doc.add_paragraph(text)

    # Save the Word document
    doc.save(word_path)
    print(f"PDF text copied to Word file: {word_path}")

# Example usage
pdf_to_word(r"C:\Users\91787\Downloads\test1.pdf",r"C:\Users\91787\Downloads\word1.docx")

