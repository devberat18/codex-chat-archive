use serde::Serialize;
use std::{
    env,
    fs,
    path::{Path, PathBuf},
    time::UNIX_EPOCH,
};

#[derive(Debug, Serialize)]
pub struct SessionFile {
    path: String,
    name: String,
    modified_ms: Option<u128>,
    size_bytes: u64,
}

#[tauri::command]
pub fn get_default_codex_sessions_path() -> Result<String, String> {
    let home_dir = home_dir().ok_or_else(|| "Could not resolve home directory".to_string())?;
    Ok(home_dir.join(".codex").join("sessions").display().to_string())
}

#[tauri::command]
pub fn list_session_files(path: String) -> Result<Vec<SessionFile>, String> {
    let root = PathBuf::from(path);

    if !root.exists() {
        return Err(format!("Sessions path does not exist: {}", root.display()));
    }

    if !root.is_dir() {
        return Err(format!("Sessions path is not a directory: {}", root.display()));
    }

    let mut files = Vec::new();
    collect_session_files(&root, &mut files)?;
    files.sort_by(|a, b| b.modified_ms.cmp(&a.modified_ms).then_with(|| a.name.cmp(&b.name)));
    Ok(files)
}

#[tauri::command]
pub fn read_session_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|error| format!("Failed to read {}: {}", path, error))
}

#[tauri::command]
pub fn save_export_file(path: String, content: String) -> Result<(), String> {
    let export_path = PathBuf::from(&path);

    if let Some(parent) = export_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Failed to create {}: {}", parent.display(), error))?;
    }

    fs::write(&export_path, content)
        .map_err(|error| format!("Failed to write {}: {}", export_path.display(), error))
}

fn collect_session_files(root: &Path, files: &mut Vec<SessionFile>) -> Result<(), String> {
    let entries = fs::read_dir(root)
        .map_err(|error| format!("Failed to list {}: {}", root.display(), error))?;

    for entry_result in entries {
        let entry = entry_result
            .map_err(|error| format!("Failed to read entry in {}: {}", root.display(), error))?;
        let path = entry.path();
        let metadata = entry
            .metadata()
            .map_err(|error| format!("Failed to inspect {}: {}", path.display(), error))?;

        if metadata.is_dir() {
            collect_session_files(&path, files)?;
            continue;
        }

        if metadata.is_file() && looks_like_session_file(&path) {
            files.push(SessionFile {
                name: path
                    .file_name()
                    .and_then(|value| value.to_str())
                    .unwrap_or("session")
                    .to_string(),
                path: path.display().to_string(),
                modified_ms: metadata.modified().ok().and_then(|modified| {
                    modified
                        .duration_since(UNIX_EPOCH)
                        .ok()
                        .map(|duration| duration.as_millis())
                }),
                size_bytes: metadata.len(),
            });
        }
    }

    Ok(())
}

fn looks_like_session_file(path: &Path) -> bool {
    match path.extension().and_then(|extension| extension.to_str()) {
        Some("jsonl") | Some("json") | Some("log") => true,
        _ => false,
    }
}

fn home_dir() -> Option<PathBuf> {
    if cfg!(windows) {
        env::var_os("USERPROFILE").map(PathBuf::from)
    } else {
        env::var_os("HOME").map(PathBuf::from)
    }
}
