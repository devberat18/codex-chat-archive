mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::get_default_codex_sessions_path,
            commands::list_session_files,
            commands::read_session_file,
            commands::save_export_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
