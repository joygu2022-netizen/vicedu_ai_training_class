"use client";

import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "../../lib/api";
import { BookOpen, Plus, Trash2, Edit, Save, X, Upload, FileText, AlertCircle } from "lucide-react";
import { useApp, appActions, Playbook } from "../../contexts/AppContext";

export default function PlaybooksPage() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState("");
  const [rulesText, setRulesText] = useState(
    JSON.stringify(
      {
        liability_cap: "12 months fees",
        data_retention: "90 days post-termination",
        indemnity_exclusions: ["force majeure", "third-party claims"],
        required_clauses: ["subprocessors", "audit rights", "SCC references"],
      },
      null,
      2
    )
  );
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Use playbooks from global state
  const playbooks = state.playbooks;

  const refresh = async () => {
    try {
      // Mock data - in real implementation, this would call api.listPlaybooks()
      // Keep existing playbooks in state
      setError(null);
    } catch (err) {
      setError("Failed to load playbooks");
      console.error(err);
    }
  };

  // Default playbooks are now handled by AppContext
  // No need to initialize here

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Playbook name is required");
      return;
    }

    try {
      const rules = JSON.parse(rulesText);
      // Mock create - in real implementation, this would call api.createPlaybook(name, rules)
      const newPlaybook = {
        playbook_id: `playbook_${Date.now()}`,
        name: name,
        rules: rules,
        created_at: new Date().toISOString(),
      };
      
      // Add to global state
      dispatch(appActions.addPlaybook(newPlaybook));
      
      setName("");
      setRulesText(
        JSON.stringify(
          {
            liability_cap: "12 months fees",
            data_retention: "90 days post-termination",
            indemnity_exclusions: ["force majeure", "third-party claims"],
            required_clauses: ["subprocessors", "audit rights", "SCC references"],
          },
          null,
          2
        )
      );
      setCreating(false);
      setError(null);
    } catch (err) {
      setError("Invalid JSON or failed to create playbook");
      console.error(err);
    }
  };

  const handleFileUpload = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setError(null);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extract file content and create playbook rules
      const content = await readFileContent(file);
      const rules = parseFileToRules(content, file.name);
      const playbookName = generatePlaybookName(file.name);
      
      // Create playbook directly
      const newPlaybook = {
        playbook_id: `playbook_${Date.now()}`,
        name: playbookName,
        rules: rules,
        created_at: new Date().toISOString(),
        source_file: file.name,
        uploaded: true,
      };
      
      // Add to global state
      dispatch(appActions.addPlaybook(newPlaybook));
      
      // Show success message
      setSuccessMessage(`Playbook "${playbookName}" created successfully from ${file.name}`);
      
      // Reset upload state
      setUploadedFile(null);
      setUploadMode(false);
      
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to process uploaded file");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, [dispatch]);

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseFileToRules = (content: string, fileName: string): any => {
    // Basic parsing logic - can be enhanced based on file type
    const rules: any = {
      source_file: fileName,
      created_from_upload: true,
      upload_date: new Date().toISOString(),
    };

    // Try to extract JSON if the file contains JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonContent = JSON.parse(jsonMatch[0]);
        return { ...rules, ...jsonContent };
      }
    } catch (e) {
      // Not JSON, continue with text parsing
    }

    // Extract key-value pairs from text content
    const lines = content.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes(':')) {
        const [key, value] = trimmed.split(':', 2);
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const cleanValue = value.trim().replace(/['"]/g, '');
        
        if (cleanKey && cleanValue) {
          rules[cleanKey] = cleanValue;
        }
      }
    });

    // If no rules extracted, create a basic structure
    if (Object.keys(rules).length <= 3) {
      return {
        ...rules,
        liability_cap: "12 months fees",
        data_retention: "90 days post-termination",
        indemnity_exclusions: ["force majeure", "third-party claims"],
        required_clauses: ["subprocessors", "audit rights", "SCC references"],
        extracted_from_file: true,
      };
    }

    return rules;
  };

  const generatePlaybookName = (fileName: string): string => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    return `${nameWithoutExt} Policy`;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'text/*': ['.txt', '.md', '.json', '.yaml', '.yml'],
      'application/json': ['.json'],
      'application/x-yaml': ['.yaml', '.yml'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  const handleDelete = async (playbookId: string) => {
    // Check if it's a default playbook
    const playbook = playbooks.find(p => p.playbook_id === playbookId);
    if (playbook?.isDefault) {
      setError("Cannot delete default playbooks. You can only delete playbooks you created.");
      return;
    }

    if (!confirm("Are you sure you want to delete this playbook?")) return;

    try {
      // Remove from global state (this will also remove from localStorage)
      dispatch(appActions.removePlaybook(playbookId));
      setError(null);
    } catch (err) {
      setError("Failed to delete playbook");
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    const userCreatedPlaybooks = playbooks.filter(p => !p.isDefault);
    if (userCreatedPlaybooks.length === 0) {
      setError("No user-created playbooks to delete. Default playbooks cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL ${userCreatedPlaybooks.length} user-created playbooks? Default playbooks will be preserved.`)) return;

    try {
      // Keep only default playbooks
      const defaultPlaybooks = playbooks.filter(p => p.isDefault);
      dispatch(appActions.setPlaybooks(defaultPlaybooks));
      setError(null);
    } catch (err) {
      setError("Failed to clear playbooks");
      console.error(err);
    }
  };

  const formatRules = (rules: any) => {
    return JSON.stringify(rules, null, 2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Playbooks</h1>
          {playbooks.some(p => p.isDefault) && (
            <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
              Mock
            </span>
          )}
        </div>
        <p className="text-gray-600">
          Define policy rules and guidelines for document review workflows
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Create New Playbook */}
      <div className="mb-8">
        {!creating ? (
          <div className="flex space-x-3">
            <button
              onClick={() => setCreating(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Playbook
            </button>
            <button
              onClick={() => setUploadMode(true)}
              className="btn-secondary flex items-center"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Playbook
            </button>
          </div>
        ) : (
          <div className="card bg-primary-50 border-2 border-primary-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Playbook
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Playbook Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Standard SaaS MSA Policy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Rules (JSON)</label>
                <textarea
                  className="input font-mono text-sm"
                  rows={12}
                  placeholder='{"liability_cap": "12 months fees"}'
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Define policy rules in JSON format
                </p>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleCreate} className="btn-primary">
                  <Save className="w-4 h-4 mr-2 inline" />
                  Create Playbook
                </button>
                <button
                  onClick={() => {
                    setCreating(false);
                    setError(null);
                  }}
                  className="btn-secondary"
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Upload Mode */}
      {uploadMode && (
        <div className="mb-8">
          <div className="card bg-blue-50 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Playbook File
            </h3>
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-400 bg-blue-100"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {uploading ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600">Processing file...</p>
                  </div>
                ) : isDragActive ? (
                  <div>
                    <p className="text-blue-600 font-medium">Drop the file here...</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Release to upload your playbook file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 font-medium">
                      Drag & drop a playbook file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports: JSON, YAML, TXT, MD files
                    </p>
                  </div>
                )}
              </div>
              
              {uploadedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        File uploaded: {uploadedFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Size: {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadMode(false);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setUploadMode(false);
                    setUploadedFile(null);
                    setError(null);
                  }}
                  className="btn-secondary"
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Playbooks List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Existing Playbooks ({playbooks.length})
          </h2>
          {playbooks.some(p => !p.isDefault) && (
            <button
              onClick={handleClearAll}
              className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear User Playbooks
            </button>
          )}
        </div>

        {playbooks.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No playbooks created yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Create your first playbook to define review policies
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {playbooks.map((playbook) => (
              <div
                key={playbook.playbook_id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {playbook.name}
                        </h3>
                        {playbook.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Default
                          </span>
                        )}
                        {playbook.uploaded && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Uploaded
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {playbook.playbook_id}
                        </span>
                        {playbook.source_file && (
                          <span className="ml-2 text-xs text-gray-500">
                            from {playbook.source_file}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setEditingId(
                          editingId === playbook.playbook_id
                            ? null
                            : playbook.playbook_id
                        )
                      }
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View/Edit rules"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {!playbook.isDefault && (
                      <button
                        onClick={() => handleDelete(playbook.playbook_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete playbook"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {editingId === playbook.playbook_id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Policy Rules
                    </h4>
                    <pre className="bg-gray-50 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                      {formatRules(playbook.rules)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Example Playbook Templates */}
      <div className="mt-12 card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Example Playbook Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">SaaS MSA Policy</h4>
            <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
              {JSON.stringify(
                {
                  liability_cap: "12 months fees",
                  payment_terms: "Net 30",
                  auto_renewal: true,
                  termination_notice: "90 days",
                },
                null,
                2
              )}
            </pre>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">GDPR DPA Policy</h4>
            <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
              {JSON.stringify(
                {
                  data_retention: "90 days post-term",
                  required_clauses: ["SCC", "audit rights"],
                  subprocessor_approval: "prior written",
                  breach_notification: "72 hours",
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
