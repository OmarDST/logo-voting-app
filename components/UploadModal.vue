<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="close">
        <Transition name="slide-up">
          <div v-if="show" class="modal-panel upload-panel" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
            <!-- Header -->
            <div class="modal-header">
              <h2 id="upload-modal-title" class="modal-title">Upload Logo</h2>
              <button class="modal-close" @click="close" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="upload-form">
              <!-- Drop Zone -->
              <div
                class="drop-zone"
                :class="{ dragging: isDragging, 'has-file': previewUrl }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                @click="fileInput?.click()"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  @change="handleFileChange"
                />

                <!-- Preview -->
                <template v-if="previewUrl">
                  <img :src="previewUrl" alt="Preview" class="preview-image" />
                  <div class="preview-overlay">
                    <span>Click to change</span>
                  </div>
                </template>

                <!-- Placeholder -->
                <template v-else>
                  <div class="drop-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p class="drop-text">Drag & drop or <span class="drop-link">browse</span></p>
                  <p class="drop-hint">PNG, JPG, SVG, WebP · Max 5MB</p>
                </template>
              </div>

              <!-- File Name -->
              <p v-if="selectedFile" class="file-name-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
                {{ selectedFile.name }} ({{ fileSizeLabel }})
              </p>

              <!-- Title Input -->
              <div class="form-group">
                <label for="logo-title-input" class="form-label">Logo Title <span class="label-optional">(optional)</span></label>
                <input
                  id="logo-title-input"
                  v-model="title"
                  type="text"
                  placeholder="e.g. Minimalist Purple Mark"
                  class="form-input"
                  maxlength="80"
                />
              </div>

              <!-- Error -->
              <div v-if="uploadError || localError" class="error-msg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ localError || uploadError }}
              </div>

              <!-- Actions -->
              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="close" :disabled="uploadLoading">
                  Cancel
                </button>
                <button
                  id="submit-upload-btn"
                  type="submit"
                  class="btn btn-primary"
                  :disabled="!selectedFile || uploadLoading"
                >
                  <template v-if="uploadLoading">
                    <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Uploading…
                  </template>
                  <template v-else>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                      <path d="M3 17l.01 2.01A2 2 0 005 21h14a2 2 0 001.99-1.99L21 17"/>
                    </svg>
                    Upload Logo
                  </template>
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  uploaded: []
}>()

const { uploadLogo, uploadLoading, uploadError } = useLogos()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const title = ref('')
const isDragging = ref(false)
const localError = ref<string | null>(null)

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const fileSizeLabel = computed(() => {
  if (!selectedFile.value) return ''
  const size = selectedFile.value.size
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
})

const setFile = (file: File) => {
  localError.value = null
  if (!file.type.startsWith('image/')) {
    localError.value = 'Please select an image file (PNG, JPG, SVG, WebP).'
    return
  }
  if (file.size > MAX_SIZE) {
    localError.value = 'File size exceeds 5MB. Please choose a smaller image.'
    return
  }
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) setFile(input.files[0])
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files?.[0]) setFile(e.dataTransfer.files[0])
}

const handleSubmit = async () => {
  if (!selectedFile.value) return
  const ok = await uploadLogo(selectedFile.value, title.value)
  if (ok) {
    emit('uploaded')
    close()
  }
}

const close = () => {
  if (uploadLoading.value) return
  selectedFile.value = null
  previewUrl.value = null
  title.value = ''
  localError.value = null
  uploadError.value = null
  emit('close')
}
</script>

<style scoped>
.upload-panel {
  max-width: 520px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  color: var(--color-primary);
  background: var(--color-bg-alt);
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--color-bg);
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 180px;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--color-primary-light);
  background: var(--color-bg-alt);
}

.drop-zone.has-file {
  padding: 0;
  border-style: solid;
  border-color: var(--color-primary-light);
}

.preview-image {
  width: 100%;
  height: 220px;
  object-fit: contain;
  padding: 1rem;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(91, 33, 182, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9375rem;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.drop-zone.has-file:hover .preview-overlay {
  opacity: 1;
}

.drop-icon {
  color: var(--color-primary-light);
  margin-bottom: 0.75rem;
  opacity: 0.7;
}

.drop-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.375rem;
}

.drop-link {
  color: var(--color-primary-light);
  text-decoration: underline;
}

.drop-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* File Name */
.file-name-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Form */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.label-optional {
  color: var(--color-text-muted);
  font-weight: 400;
}

.form-input {
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-bg);
  font-size: 0.9375rem;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
  outline: none;
}

.form-input:focus {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

/* Error */
.error-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #DC2626;
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-md);
  padding: 0.625rem 0.875rem;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

/* Spin animation */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
