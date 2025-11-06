import {
    IndexPosition,
    Heading_Index,
    index_create,
    read_and_index,
    lookup_index,
    write_index
} from './index';

// Function to update the Index
export function update_index(index_position: IndexPosition, file_path: string, lines: string[]) {
    // Print Info
    console.log("Updating Index for File: " + file_path);

    // Checking for undefined
    if (index_position.line_start === undefined) {
        process.exit(1);
    }
    if (index_position.line_end === undefined) {
        process.exit(1);
    }

    // console.log(index_position.line_start)
    // console.log(index_position.line_end)

    const st = index_position.line_start;
    const ed = index_position.line_end;

    // Alles zwischen start und end line löschen
    // Why do you not work?
    lines.splice(st - 1, ed - st + 1, index_create);

    // Tranform the Array of Lines to one String seperated with \n
    const content = lines.join("\n");

    // Create a new Heading Index with the new content
    const index: Heading_Index[] = read_and_index(content);

    // Update the Index Position
    const index_position_new = lookup_index(content);

    // Check for Null
    if (index_position_new === null) {
        console.error("Could not update the Index Postion")
        process.exit(1)
    }

    // Neuen Index generieren
    write_index(file_path, index, index_position_new, content);

    // Returning because the function calls itself
    return;
}
