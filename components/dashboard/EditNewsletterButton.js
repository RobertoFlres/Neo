"use client";

export function EditNewsletterButton({ editing, setEditing, onSave, saving }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setEditing(!editing)}
        className={`btn btn-sm ${editing ? "btn-warning" : "btn-primary"}`}
      >
        {editing ? "✏️ Editando" : "✏️ Editar"}
      </button>
      {editing && (
        <button
          onClick={onSave}
          className="btn btn-success btn-sm"
          disabled={saving}
        >
          {saving ? "💾 Guardando..." : "💾 Guardar"}
        </button>
      )}
    </div>
  );
}

