"use client";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function PostContentEditor({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-2 min-h-[200px]">
      <ReactQuill
        value={value}
        onChange={onChange}
        theme="snow"
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        }}
        formats={[
          "header",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "align",
          "list",
          "bullet",
          "link",
          "image",
        ]}
        style={{ minHeight: 180 }}
      />
    </div>
  );
}
