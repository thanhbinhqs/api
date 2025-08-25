-- Task Module Migration
-- Tạo bảng tasks và các bảng liên quan

-- Tạo enum types
CREATE TYPE task_type AS ENUM ('manual', 'maintenance', 'inspection', 'repair', 'cleaning', 'calibration');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'overdue');
CREATE TYPE assignee_type AS ENUM ('user', 'role');
CREATE TYPE file_attachment_type AS ENUM ('image', 'document', 'drawing', 'video', 'audio', 'archive', 'other');
CREATE TYPE file_attachment_category AS ENUM ('instruction', 'reference', 'drawing', 'photo', 'result', 'safety', 'checklist', 'report', 'other');

-- Tạo bảng tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT,
    content TEXT, -- Nội dung chi tiết như bài viết
    content_type VARCHAR DEFAULT 'plain_text', -- html, markdown, plain_text
    type task_type NOT NULL DEFAULT 'manual',
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'pending',
    assignee_type assignee_type NOT NULL DEFAULT 'user',
    
    -- Relationships
    executed_by_id UUID REFERENCES users(id),
    task_created_by_id UUID NOT NULL REFERENCES users(id),
    related_jig_id UUID REFERENCES jigs(id),
    related_jig_detail_id UUID REFERENCES jig_details(id),
    parent_task_id UUID REFERENCES tasks(id),
    
    -- Time fields
    scheduled_start_date TIMESTAMP WITH TIME ZONE,
    scheduled_end_date TIMESTAMP WITH TIME ZONE,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- minutes
    actual_duration INTEGER, -- minutes
    
    -- Additional fields
    completion_notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval INTEGER, -- days
    checklist JSONB,
    attachments JSONB,
    tags JSONB,
    
    -- Rich content fields
    images JSONB, -- URLs hoặc paths của hình ảnh
    documents JSONB, -- URLs hoặc paths của tài liệu
    video_url VARCHAR, -- URL video hướng dẫn
    related_links JSONB, -- Các link liên quan
    safety_instructions TEXT, -- Hướng dẫn an toàn
    tools_required TEXT, -- Dụng cụ cần thiết
    expected_outcome TEXT, -- Kết quả mong đợi
    
    -- Base entity fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR DEFAULT 'system',
    updated_by VARCHAR DEFAULT 'system'
);

-- Tạo bảng many-to-many cho task assigned users
CREATE TABLE IF NOT EXISTS task_assigned_users (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);

-- Tạo bảng many-to-many cho task assigned roles
CREATE TABLE IF NOT EXISTS task_assigned_roles (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, role_id)
);

-- Tạo bảng task_attachments
CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    filename VARCHAR NOT NULL,
    original_name VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR NOT NULL,
    file_type file_attachment_type NOT NULL DEFAULT 'other',
    category file_attachment_category NOT NULL DEFAULT 'other',
    description TEXT,
    thumbnail_path VARCHAR,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    last_download_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    tags JSONB,
    
    -- Base entity fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR DEFAULT 'system',
    updated_by VARCHAR DEFAULT 'system'
);

-- Tạo indexes cho performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_content_type ON tasks(content_type);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_start_date ON tasks(scheduled_start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_end_date ON tasks(scheduled_end_date);
CREATE INDEX IF NOT EXISTS idx_tasks_executed_by ON tasks(executed_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(task_created_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_related_jig ON tasks(related_jig_id);
CREATE INDEX IF NOT EXISTS idx_tasks_related_jig_detail ON tasks(related_jig_detail_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_recurring ON tasks(is_recurring);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tasks_images ON tasks USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_tasks_documents ON tasks USING GIN(documents);
CREATE INDEX IF NOT EXISTS idx_tasks_related_links ON tasks USING GIN(related_links);

-- Full text search index cho content
CREATE INDEX IF NOT EXISTS idx_tasks_content_search ON tasks USING GIN(to_tsvector('english', COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS idx_tasks_title_description_search ON tasks USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Index cho junction tables
CREATE INDEX IF NOT EXISTS idx_task_assigned_users_task ON task_assigned_users(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assigned_users_user ON task_assigned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assigned_roles_task ON task_assigned_roles(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assigned_roles_role ON task_assigned_roles(role_id);

-- Composite indexes cho common queries
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_type_status ON tasks(type, status);
CREATE INDEX IF NOT EXISTS idx_tasks_overdue ON tasks(scheduled_end_date, status) 
    WHERE status IN ('pending', 'in_progress');

-- Trigger để auto update updated_at
CREATE OR REPLACE FUNCTION update_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_updated_at();

-- Comments
COMMENT ON TABLE tasks IS 'Bảng quản lý nhiệm vụ (tasks) trong hệ thống - có thể giao bất kỳ nhiệm vụ gì cho bất kỳ ai';
COMMENT ON COLUMN tasks.content IS 'Nội dung chi tiết của task như một bài viết (có thể là HTML, Markdown hoặc plain text)';
COMMENT ON COLUMN tasks.content_type IS 'Loại nội dung: html, markdown, plain_text';
COMMENT ON COLUMN tasks.type IS 'Loại task: manual, maintenance, inspection, repair, cleaning, calibration';
COMMENT ON COLUMN tasks.priority IS 'Mức độ ưu tiên: low, medium, high, urgent';
COMMENT ON COLUMN tasks.status IS 'Trạng thái: pending, in_progress, completed, cancelled, overdue';
COMMENT ON COLUMN tasks.assignee_type IS 'Kiểu phân công: user (giao cho user cụ thể), role (giao cho role/nhóm)';
COMMENT ON COLUMN tasks.is_recurring IS 'Task lặp lại định kỳ hay không';
COMMENT ON COLUMN tasks.recurring_interval IS 'Khoảng thời gian lặp lại (ngày)';
COMMENT ON COLUMN tasks.checklist IS 'Danh sách kiểm tra dạng JSON';
COMMENT ON COLUMN tasks.attachments IS 'File đính kèm dạng JSON';
COMMENT ON COLUMN tasks.tags IS 'Tags phân loại dạng JSON array';
COMMENT ON COLUMN tasks.images IS 'URLs hoặc paths của hình ảnh minh họa';
COMMENT ON COLUMN tasks.documents IS 'URLs hoặc paths của tài liệu đính kèm';
COMMENT ON COLUMN tasks.video_url IS 'URL video hướng dẫn thực hiện task';
COMMENT ON COLUMN tasks.related_links IS 'Các link liên quan hữu ích';
COMMENT ON COLUMN tasks.safety_instructions IS 'Hướng dẫn an toàn khi thực hiện task';
COMMENT ON COLUMN tasks.tools_required IS 'Danh sách dụng cụ, thiết bị cần thiết';
COMMENT ON COLUMN tasks.expected_outcome IS 'Kết quả mong đợi sau khi hoàn thành task';
