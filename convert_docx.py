import os
import re
from docx import Document
from docx.oxml.ns import qn

def get_paragraph_style(para):
    if para.style is None:
        return "Normal"
    return para.style.name or "Normal"

def runs_to_md(para):
    result = ""
    for run in para.runs:
        text = run.text
        if not text:
            continue
        if run.bold and run.italic:
            text = f"***{text}***"
        elif run.bold:
            text = f"**{text}**"
        elif run.italic:
            text = f"*{text}*"
        result += text
    return result

def table_to_md(table):
    lines = []
    rows = table.rows
    if not rows:
        return ""

    header = rows[0]
    header_cells = [cell.text.replace("\n", " ").strip() for cell in header.cells]
    lines.append("| " + " | ".join(header_cells) + " |")
    lines.append("| " + " | ".join(["---"] * len(header_cells)) + " |")

    for row in rows[1:]:
        cells = [cell.text.replace("\n", " ").strip() for cell in row.cells]
        lines.append("| " + " | ".join(cells) + " |")

    return "\n".join(lines)

def docx_to_md(docx_path):
    doc = Document(docx_path)
    lines = []

    list_counters = {}
    prev_was_list = False

    for block in doc.element.body:
        tag = block.tag.split("}")[-1] if "}" in block.tag else block.tag

        if tag == "p":
            from docx.text.paragraph import Paragraph
            para = Paragraph(block, doc)
            style = get_paragraph_style(para)
            text = runs_to_md(para)
            raw_text = para.text.strip()

            if not raw_text:
                lines.append("")
                prev_was_list = False
                continue

            numPr = block.find(f".//{{{block.nsmap.get('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')}}}numPr") if hasattr(block, 'nsmap') else None

            ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            numPr_el = block.find(f".//{{{ns}}}numPr")

            if numPr_el is not None:
                ilvl_el = numPr_el.find(f"{{{ns}}}ilvl")
                numId_el = numPr_el.find(f"{{{ns}}}numId")
                ilvl = int(ilvl_el.get(f"{{{ns}}}val", "0")) if ilvl_el is not None else 0
                numId = numId_el.get(f"{{{ns}}}val", "0") if numId_el is not None else "0"

                indent = "  " * ilvl

                try:
                    abstract_num_id = None
                    for num in doc.part.numbering_part._element.findall(f"{{{ns}}}num"):
                        if num.get(f"{{{ns}}}numId") == numId:
                            abstract_ref = num.find(f"{{{ns}}}abstractNumId")
                            if abstract_ref is not None:
                                abstract_num_id = abstract_ref.get(f"{{{ns}}}val")

                    is_ordered = False
                    if abstract_num_id is not None:
                        for an in doc.part.numbering_part._element.findall(f"{{{ns}}}abstractNum"):
                            if an.get(f"{{{ns}}}abstractNumId") == abstract_num_id:
                                for lvl in an.findall(f"{{{ns}}}lvl"):
                                    if lvl.get(f"{{{ns}}}ilvl") == str(ilvl):
                                        numFmt_el = lvl.find(f"{{{ns}}}numFmt")
                                        if numFmt_el is not None:
                                            fmt = numFmt_el.get(f"{{{ns}}}val", "")
                                            is_ordered = fmt not in ("bullet", "none")
                except Exception:
                    is_ordered = False

                key = (numId, ilvl)
                if is_ordered:
                    list_counters[key] = list_counters.get(key, 0) + 1
                    lines.append(f"{indent}{list_counters[key]}. {text}")
                else:
                    list_counters.pop(key, None)
                    lines.append(f"{indent}- {text}")
                prev_was_list = True
                continue
            else:
                list_counters.clear()

            if prev_was_list:
                lines.append("")
            prev_was_list = False

            if re.match(r"Heading (\d)", style):
                level = int(re.match(r"Heading (\d)", style).group(1))
                lines.append(f"{'#' * level} {raw_text}")
            elif style == "Title":
                lines.append(f"# {raw_text}")
            elif style == "Subtitle":
                lines.append(f"## {raw_text}")
            else:
                lines.append(text if text else raw_text)

        elif tag == "tbl":
            from docx.table import Table
            table = Table(block, doc)
            lines.append("")
            lines.append(table_to_md(table))
            lines.append("")
            prev_was_list = False

    md = "\n".join(lines)
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip()


def main():
    docs_dir = os.path.join(os.path.dirname(__file__), "docs")
    docx_files = [f for f in os.listdir(docs_dir) if f.endswith(".docx")]

    for docx_file in docx_files:
        docx_path = os.path.join(docs_dir, docx_file)
        md_filename = os.path.splitext(docx_file)[0] + ".md"
        md_path = os.path.join(docs_dir, md_filename)

        print(f"Converting: {docx_file} -> {md_filename}")
        try:
            md_content = docx_to_md(docx_path)
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(md_content)
            print(f"  Done: {md_path}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    main()
