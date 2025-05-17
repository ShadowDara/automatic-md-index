// MIT License Shadowdara 2025
// Create MD Index
// This script reads a Markdown file and creates an index of all headings.

import fs from 'fs';
import path from 'path';


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


// Export Functions
function create(file_path: string) {
    const content = fs.readFileSync(file_path, 'utf-8');

    const index_position = lookup_index(content);

    if (index_position === null) {
        console.error()
    } else if (index_position.type === 'update') {

    } else if (index_position.type === 'create') {

    } else {
        console.error("Could not create index for file: " + file_path);
        return;
    }
    // Error

    const index = read_and_index(content);

    if (index_position !== null) {
        write_index(file_path, index, index_position);
    } else {
        console.error("Index position is null. Cannot write index.");
    }

    console.log(`Index created for ${file_path}`);
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


// to see if an idex should be created in the and where
// INFO:
// if the index position is not valid or not found,
// the return will be null
function lookup_index(content: string) {
    const lines = content.split('\n');

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
                const position: IndexPosition = {
                    type: 'create',
                    line: i + 1
                }
                return position
            }
        }
    }
    console.error('No index found');
    return null;
}


function write_index(file_path: string, index: Heading_Index[], index_position: IndexPosition) {
    const content = fs.readFileSync(file_path, 'utf-8');
    const lines = content.split('\n');

    // Add the index at the beginning of the file
    const index_lines = index.map(item => {
        return `${'#'.repeat(item.level)} [${item.title}](#${item.title.replace(/\s+/g, '-').toLowerCase()})`;
    });

    // Insert the index at the beginning of the file
    lines.unshift(...index_lines);
    fs.writeFileSync(file_path, lines.join('\n'), 'utf-8');
}


if (path.resolve(__filename) === path.resolve(process.argv[1])) {
    // add way to find all md files in the current directory
    // and subdirectories
    // and a way to ignore some md files

    // const mdFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.md'));
    // for (const file of mdFiles) {

    console.log(__dirname)
    console.log(process.cwd());

    //const mdFile = path.join(__dirname, 'README.md');
    //create(mdFile);
}


function search_all_md_files() {
    // search all md files in the current directory
    // and subdirectories
    const mdFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.md'));
    return mdFiles;
}


function create_all() {
    const files = search_all_md_files();
    for (const file of files) {
        const file_path = path.join(__dirname, file);
        create(file_path);
    }
}


// exporting functions
export {
    search_all_md_files,
    create_all,
    create,
    read_and_index,
    write_index,
    lookup_index
};
