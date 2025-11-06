// Function to print a help Message for AutomaticMDIndex
export function mdindex_help() {
    console.log(`Help for Automatic MD Index

Run with node index.js <arg>

<arg>:
    --help        to print this Help Message
    --test        to enable the test mode for Debug Infos
    --no-strict   to disable strict Mode, which means, if there is no Indexposition found, the file will be ignored with a warning. In strict Mode the Programm would exit with Code 1
    --files       to add files which should be processed, seperate 2 or more files with a comma.`);
}
