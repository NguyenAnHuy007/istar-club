"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
  Code,
  Eye,
} from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Nhập nội dung thông tin đợt tuyển (lịch trình, địa điểm, lưu ý...)...",
  minHeight = "160px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const isInternalChangeRef = useRef(false);

  // Sync incoming value to contentEditable when not internally edited
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
    setRawHtml(value || "");
    isInternalChangeRef.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isInternalChangeRef.current = true;
    const html = editorRef.current.innerHTML;
    // Normalize empty content
    const cleanHtml = html === "<p><br></p>" || html === "<br>" ? "" : html;
    setRawHtml(cleanHtml);
    onChange(cleanHtml);
  }, [onChange]);

  const exec = (command: string, val: string | undefined = undefined) => {
    if (isSourceMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    const url = linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
      ? linkUrl
      : `https://${linkUrl}`;
    editorRef.current?.focus();
    exec("createLink", url);
    setLinkUrl("");
    setLinkModalOpen(false);
  };

  const handleHeading = (tag: "h2" | "h3" | "p") => {
    exec("formatBlock", `<${tag}>`);
  };

  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Switching from source to visual
      if (editorRef.current) {
        editorRef.current.innerHTML = rawHtml;
      }
      onChange(rawHtml);
    } else {
      // Switching from visual to source
      if (editorRef.current) {
        setRawHtml(editorRef.current.innerHTML);
      }
    }
    setIsSourceMode(!isSourceMode);
  };

  return (
    <div className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-[#255798] focus-within:ring-1 focus-within:ring-[#255798]/60 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white/[0.02] border-b border-white/[0.06] select-none">
        <button
          type="button"
          onClick={() => exec("bold")}
          title="In đậm (Ctrl+B)"
          className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("italic")}
          title="In nghiêng (Ctrl+I)"
          className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("underline")}
          title="Gạch chân (Ctrl+U)"
          className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-white/[0.1] mx-1" />

        <button
          type="button"
          onClick={() => handleHeading("h2")}
          title="Tiêu đề chính (H2)"
          className="px-2 py-1 rounded-lg text-xs font-semibold text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center gap-0.5"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleHeading("h3")}
          title="Tiêu đề phụ (H3)"
          className="px-2 py-1 rounded-lg text-xs font-semibold text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center gap-0.5"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-white/[0.1] mx-1" />

        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          title="Danh sách dấu chấm"
          className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          title="Danh sách số thứ tự"
          className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleHeading("p")}
          title="Đoạn văn bình thường"
          className="px-2 py-1 rounded-lg text-xs font-medium text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          Đoạn văn
        </button>

        <button
          type="button"
          onClick={() => exec("formatBlock", "<blockquote>")}
          title="Trích dẫn"
          className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-white/[0.1] mx-1" />

        <button
          type="button"
          onClick={() => setLinkModalOpen(true)}
          title="Chèn liên kết"
          className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("unlink")}
          title="Gỡ liên kết"
          className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <Unlink className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("removeFormat")}
          title="Xóa định dạng"
          className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggleSourceMode}
            title={isSourceMode ? "Xem trực quan" : "Xem mã HTML"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs ${
              isSourceMode
                ? "bg-[#255798]/20 text-[#4d8ee8] border border-[#255798]/40"
                : "text-[#8A8F98] hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            {isSourceMode ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Trực quan</span>
              </>
            ) : (
              <>
                <Code className="w-3.5 h-3.5" />
                <span>HTML</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Link Input Bar */}
      {linkModalOpen && (
        <form
          onSubmit={handleInsertLink}
          className="p-2.5 bg-[#255798]/10 border-b border-[#255798]/30 flex items-center gap-2 animate-fade-in"
        >
          <LinkIcon className="w-3.5 h-3.5 text-[#4d8ee8] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Nhập địa chỉ URL (ví dụ: https://istarclub.com)..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 bg-black/50 border border-white/[0.1] text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#255798]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#255798] hover:bg-[#316ebf] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Chèn Link
          </button>
          <button
            type="button"
            onClick={() => setLinkModalOpen(false)}
            className="px-2 py-1.5 text-xs text-[#8A8F98] hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Hủy
          </button>
        </form>
      )}

      {/* Editor Content Area */}
      {isSourceMode ? (
        <textarea
          value={rawHtml}
          onChange={(e) => {
            setRawHtml(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-3.5 bg-black/40 text-xs font-mono text-emerald-300 outline-none resize-y"
        />
      ) : (
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            style={{ minHeight }}
            className="p-3.5 outline-none text-sm text-[#EDEDEF] leading-relaxed overflow-y-auto rich-text-content focus:outline-none"
          />
          {!rawHtml && (
            <div className="absolute top-3.5 left-3.5 text-xs text-[#8A8F98]/50 pointer-events-none select-none">
              {placeholder}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
