// MIT License Shadowdara 2025
// Create MD Index
// This script reads a Markdown file and creates an index of all headings.

import fs, { copyFileSync } from 'fs';
import path from 'path';

let test_mode = false;

interface IndexPosition {
    type: 'create' | 'update'; // create or update
    line_start?: number;       // start line for update
    line_end?: number;         // end line for update
    line?: number;             // line for create
}


interface Heading_Index {
    level: number;            // Heading level (1-6)
    title: string;            // Title of the heading
    line: number;             // Line number in the file
}

const error = {
    1: "Line 150 - add the Error!",
    2: "eww"
}

// Function to read the content
// and return an array of Headings
function read_and_index(content: string): Heading_Index[] {
    const lines = content.split('\n');
    const index: Heading_Index[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^(#{1,6})\s+(.*)/);  // Nur gültige Markdown-Überschriften

        if (match) {
            const level = match[1].length;            // Anzahl der '#' bestimmt die Ebene
            const title = match[2].trim();            // Der Text der Überschrift
            index.push({ level, title, line: i + 1 }); // Zeilennummer ist 1-basiert
        }
        else {
            const match_html = line.match(/<h([1-6])>(.*?)<\/h\1>/); // HTML-Überschriften

            if (match_html) {
                const level = parseInt(match_html[1], 10); // HTML-Überschrift-Ebene
                const title = match_html[2].trim();         // Der Text der Überschrift
                index.push({ level, title, line: i + 1 });  // Zeilennummer ist 1-basiert
            }
        }
    }
    return index;
}


function write_index(file_path: string, index: Heading_Index[], index_position: IndexPosition) {
    const content = fs.readFileSync(file_path, 'utf-8');
    const lines = content.split('\n');

    // Add the index at the beginning of the file
    const index_lines = index.map(item => {
        return `${'  '.repeat((item.level - 1))}- [${item.title}](#${item.title.replace(/\s+/g, '-').toLowerCase()})`;
    });

    if (index_position.type === 'update') {
        console.log("Updating Index")

    } else if ((index_position.type === 'create') && (index_position.line != null)) {
        lines.splice(index_position.line, 1, "# Index");
        console.log("Line Deleted!")
        for (const i in index_lines) {
            lines.splice(index_position.line + Number(i) + 1, 0, index_lines[i])
            console.log(index_lines[i])
        }
    }

    // Insert the index at the beginning of the file
    fs.writeFileSync(file_path, lines.join('\n'), 'utf-8');
}


// to see if an idex should be created in the and where
// INFO:
// if the index position is not valid or not found,
// the return will be null
function lookup_index(content: string) {
    const lines = content.split('\n');

    d("")
    d("Looking for Index")

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/<!--\$\$((<!--\$\$((MD_INDEX_START))\$\$-->))\$\$-->/);

        if (match) {
            const start = i + 1;
            const match_end = line.match(/<!--\$\$((MD_INDEX_END))\$\$-->/);

            if (match_end) {
                const end = i + 1;

                const position: IndexPosition = {
                    type: 'update',
                    line_start: start,
                    line_end: end
                }
                return position
            } else {
                console.error('No index end found');
                return null;
            }

        } else {
            const match_create = line.match(/<!--\$\$((MD_INDEX))\$\$-->/)
            if (match_create) {
                // create the index here

                d("")
                d("Index Create Found!")
                const position: IndexPosition = {
                    type: 'create',
                    line: i
                }
                return position
            }
        }
    }
    console.error('No index found');
    return null;
}


// Export Functions
function create(file_path: string) {
    const content = fs.readFileSync(file_path, 'utf-8');

    const index_position = lookup_index(content);

    d("\nafter Look Index\n")

    console.log(index_position)

    if (index_position === null) {
        console.error("No Index created for File: " + file_path)
        return
    } else {
        const index = read_and_index(content);
        if (index_position !== null) {
            write_index(file_path, index, index_position);
        } else {
            console.error(error[1]);
        }

        console.log(`Index created for ${file_path}`);
    }

    /*
    if (index_position.type === 'update') {
        console.log("Updating Index")

    } else if (index_position.type === 'create') {
        console.log("Creating Index")

    } 
    }
        */
    // Error
}


if (path.resolve(__filename) === path.resolve(process.argv[1])) {
    // add way to find all md files in the current directory
    // and subdirectories
    // and a way to ignore some md files

    const args = process.argv.slice(2);

    let execution_path = process.cwd();

    for (const arg of args) {
        if (arg === '--test') {
            test_mode = true;
            d("Starting: Testmode")
            d("Using: Testpath\n")
            execution_path = path.join(process.cwd(), "test", "markdown_output");
        }
    }

    console.log(execution_path);

    const mdFiles = fs.readdirSync(execution_path).filter(file => file.endsWith('.md')).map(file => path.join(execution_path, file));


    for (const file of mdFiles) {
        console.log(file)
        create(file)
    }
}


function d(msg: string) {
    if (test_mode) {
        console.log(msg)
    }
}


// exporting functions
export {
    create,
    read_and_index,
    write_index,
    lookup_index
};
