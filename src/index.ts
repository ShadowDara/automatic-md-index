/* 
 * MIT License Shadowdara 2025
 * Create MD Index
 * Dieses Skript liest eine Markdown-Datei ein und erstellt automatisch
 * ein Inhaltsverzeichnis (Index) basierend auf allen gefundenen Überschriften.
 * 
 */

// Import von Node.js-Modulen
import fs, { copyFileSync } from 'fs';
import path from 'path';

// Import Local Functions
import { mdindex_help } from './helper';

// Const for the Index Recognition
const index_start = "<!--$$MD_INDEX_START$$-->";
const index_end = "<!--$$MD_INDEX_END$$-->";
const index_create = "<!--$$MD_INDEX$$-->";

// Testmodus – aktiviert zusätzliche Konsolenausgaben
let test_mode = false;

// Interface zur Beschreibung der Position, an der der Index erstellt oder aktualisiert wird
interface IndexPosition {
    type: 'create' | 'update'; // Gibt an, ob der Index neu erstellt oder aktualisiert wird
    line_start?: number;       // Startzeile für Update
    line_end?: number;         // Endzeile für Update
    line?: number;             // Zeile für Erstellung
}

// Interface für gefundene Überschriften im Markdown
interface Heading_Index {
    level: number;            // Ebene der Überschrift (1–6)
    title: string;            // Text der Überschrift
    line: number;             // Zeilennummer im Dokument (1-basiert)
}

// Fehlercode-Wörterbuch für Debugging oder zukünftige Erweiterung
const error = {
    1: "Line 150 - add the Error!",
    2: "eww"
}

// ------------------------------------------------------------
// Funktion: read_and_index
// ------------------------------------------------------------
// Liest den Markdown-Inhalt und gibt ein Array aller Überschriften zurück.
// Unterstützt sowohl Markdown-Syntax (# ...) als auch HTML-Überschriften (<h1>...</h1>).
function read_and_index(content: string): Heading_Index[] {
    const lines = content.split('\n'); // Datei in einzelne Zeilen aufteilen
    const index: Heading_Index[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Markdown-Überschriften erkennen (z. B. ## Titel)
        const match = line.match(/^(#{1,6})\s+(.*)/);

        if (match) {
            const level = match[1].length;   // Anzahl der '#' = Ebene der Überschrift
            const title = match[2].trim();   // Text der Überschrift
            index.push({ level, title, line: i + 1 }); // In Liste aufnehmen (Zeilen sind 1-basiert)
        }
        else {
            // HTML-Überschriften erkennen (z. B. <h2>Titel</h2>)
            const match_html = line.match(/<h([1-6])>(.*?)<\/h\1>/);

            if (match_html) {
                const level = parseInt(match_html[1], 10);
                const title = match_html[2].trim();
                index.push({ level, title, line: i + 1 });
            }
        }
    }
    return index;
}


// ------------------------------------------------------------
// Funktion: write_index
// ------------------------------------------------------------
// Schreibt den erstellten Index in die Markdown-Datei.
// Je nach Typ (create/update) wird er entweder neu eingefügt oder ersetzt.
function write_index(file_path: string, index: Heading_Index[], index_position: IndexPosition, content: String) {
    const lines = content.split('\n');

    // Den eigentlichen Indextext aus den Überschriften aufbauen
    const index_lines = index.map(item => {
        // Jede Überschrift wird als verschachtelte Markdown-Liste dargestellt
        return `${'  '.repeat((item.level - 1))}- [${item.title}](#${item.title.replace(/\s+/g, '-').toLowerCase()})`;
    });

    // Updating the Index
    if (index_position.type === 'update') {
        // Print Info
        console.log("Updating Index for File: " + file_path);

        // Hier könnte man den alten Index zwischen line_start und line_end ersetzen
        // (noch nicht implementiert)

        // TODO
        if (index_position.line_start === undefined) {
            process.exit(1);
        }
        if (index_position.line_end === undefined) {
            process.exit(1);
        }

        console.log(index_position.line_start)
        console.log(index_position.line_end)

        const st = index_position.line_start;
        const ed = index_position.line_end;

        // Alles zwischen start und end line löschen
        // Why do you not work?
        lines.splice(st - 1, ed - st + 1, index_create);

        // Tranform the Array of Lines to one String seperated with \n
        const content = lines.join("\n");

        // Neuen Index generieren
        write_index(file_path, index, index_position, content);

        // Returning because the function calls itself
        return;
    }

    // Creating the Index
    else if ((index_position.type === 'create') && (index_position.line != null)) {
        // Print Info
        console.log("Creating Index for File: " + file_path);

        // Get the current Date
        const now = new Date();

        // Message which gets added before the Index when creating an Index
        const top = index_start + `
<!-- 
    Index by Automatic MD Index
    a simple Tool to Index your Markdown files like this

    More Infos:
    https://github.com/ShadowDara/automatic-md-index

    DO NOT REMOVE THIS CREDIT !!!

    Last Update Time of the Index:
    ${now.toISOString()}
-->
` + "## Index";

        // Message which gets added after the Creation of an Index
        const bottom = "<!-- Index by Automatic MD Index -->\n" + index_end;

        // Wenn ein Platzhalter für den Index gefunden wurde, dort einfügen
        lines.splice(index_position.line, 1, top);
        // Platzhalterzeile ersetzen

        // Danach alle Indexzeilen direkt darunter einfügen
        for (const i in index_lines) {
            lines.splice(index_position.line + Number(i) + 1, 0, index_lines[i]);
            // console.log(index_lines[i]);
        }

        // Nach der letzten Index-Zeile noch 'bottom' hinzufügen
        const last_index_line = index_position.line + index_lines.length;
        lines.splice(last_index_line + 1, 0, bottom);
    }

    // Änderungen wieder in die Datei schreiben
    fs.writeFileSync(file_path, lines.join('\n'), 'utf-8');
}


// ------------------------------------------------------------
// Funktion: lookup_index
// ------------------------------------------------------------
// Durchsucht den Inhalt der Markdown-Datei nach speziellen Kommentaren,
// die den Index definieren:
// <!--$$MD_INDEX$$-->  → Index soll hier erstellt werden
// <!--$$MD_INDEX_START$$--> und <!--$$MD_INDEX_END$$--> → Bereich für Update
// Gibt ein IndexPosition-Objekt oder null zurück.
function lookup_index(content: string) {
    // Split the file for it's lines
    const lines = content.split('\n');

    debug_message("");
    debug_message("Looking for Index");

    let start = 0;
    let end = 0;

    // For Schleife um das ganze file durchzugehen
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Prüfen, ob bereits ein Index vorhanden ist (für Update)
        const match = line.match(/<!--\$\$((MD_INDEX_START))\$\$-->/);

        // Looking for the begin of the Index
        if (match) {
            // The Line Number where the Index is located
            start = i + 1;
            continue;
        }

        // Prüfen ob INDEX_END da ist
        const match_end = line.match(/<!--\$\$((MD_INDEX_END))\$\$-->/);

        // Looking for the Index End
        if (match_end) {
            const end = i + 1;
            const position: IndexPosition = {
                type: 'update',
                line_start: start,
                line_end: end
            };
            return position;
        }

        // Prüfen, ob ein Platzhalter für Erstellung existiert
        const match_create = line.match(/<!--\$\$((MD_INDEX))\$\$-->/);

        if (match_create) {
            debug_message("\nIndex Create Found!");
            const position: IndexPosition = {
                type: 'create',
                line: i
            };
            return position;
        }
    }

    // Kein End for MD Index gefunden
    if(start != 0 && end == 0) {
        console.error('No index End specifier found');
        return null;
    }

    // Kein Index-Platzhalter gefunden
    console.error('No index found');
    return null;
}


// ------------------------------------------------------------
// Hauptfunktion: create
// ------------------------------------------------------------
// Führt den gesamten Ablauf für eine Datei aus:
// 1. Datei lesen
// 2. Position für Index finden
// 3. Überschriften einlesen
// 4. Index schreiben
function create(file_path: string) {
    // Read the content of the File
    const content = fs.readFileSync(file_path, 'utf-8');

    // Get the Index Position
    const index_position = lookup_index(content);

    debug_message("\nafter Look Index\n");

    // // Print the Indexpostion Interface which contains
    // // the type of the work for the index and the Line for the Index
    // console.log(index_position);

    if (index_position === null) {
        console.error("No Index created for File: " + file_path);
        return;
    } else {
        const index = read_and_index(content);
        if (index_position !== null) {
            const content = fs.readFileSync(file_path, 'utf-8');
            write_index(file_path, index, index_position, content);
        } else {
            console.error(error[1]);
        }

        console.log(`Index created for ${file_path}`);
    }
}


// ------------------------------------------------------------
// CLI-Teil (wird nur ausgeführt, wenn Datei direkt gestartet wird)
// ------------------------------------------------------------
if (path.resolve(__filename) === path.resolve(process.argv[1])) {
    // Ermöglicht den Testmodus (--test) und das automatische Durchsuchen
    // eines Ordners nach .md-Dateien

    const args = process.argv.slice(2);
    let execution_path = process.cwd(); // aktuelles Arbeitsverzeichnis

    for (const arg of args) {
        // Printing help bei --help arg
        if (arg === '--help') {
            mdindex_help();
            process.exit(0);
        }
        // Wenn "--test" übergeben wurde, Testmodus aktivieren
        if (arg === '--test') {
            test_mode = true;
            debug_message("Starting: Testmode");
            debug_message("Using: Testpath\n");
            // Testverzeichnis definieren
            execution_path = path.join(process.cwd(), "test", "markdown_output");
        }
    }

    // Printing the Execution Path into the Terminal
    debug_message(execution_path);

    // Alle Markdown-Dateien im Verzeichnis suchen
    const mdFiles = fs.readdirSync(execution_path)
        .filter(file => file.endsWith('.md'))
        .map(file => path.join(execution_path, file));

    // Für jede Datei den Index erstellen
    for (const file of mdFiles) {
        // Printing the Current File
        debug_message(file);
        create(file);
    }
}


// ------------------------------------------------------------
// Hilfsfunktion: debug_message()
// ------------------------------------------------------------
// Gibt Debug-Nachrichten nur aus, wenn test_mode aktiv ist.
function debug_message(msg: string) {
    if (test_mode) {
        console.log(msg);
    }
}


// ------------------------------------------------------------
// Exporte der Funktionen
// ------------------------------------------------------------
export {
    create,
    read_and_index,
    write_index,
    lookup_index
};
