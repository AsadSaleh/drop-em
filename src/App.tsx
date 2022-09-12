import classNames from "classnames";
import React, { useEffect, useId, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface MyFile {
  id: string;
  file: File;
}

export default function App() {
  const elementId = useId();
  const [isHovering, setIsHovering] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Array<MyFile>>([]);

  function handleSelectFileButton(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((file) => ({
        id: uuidv4(),
        file,
      }));
      setSelectedFiles((cur) => cur.concat(files));
    }
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.items) {
      Array.from(e.dataTransfer.items).forEach((item, i) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            setSelectedFiles((curr) => curr.concat({ id: uuidv4(), file }));
          }
        }
      });
    }
  }

  function handleFileDelete(id: string) {
    setSelectedFiles((oldFiles) => oldFiles.filter((file) => file.id !== id));
  }

  return (
    <main className="container mx-auto w-full md:w-3/4 lg:w-1/2 px-2">
      <section>
        <h1 className="text-3xl mt-4">Welcome to Drop Em!</h1>
        <h2 className="text-xl text-gray-600">A drag and drop example</h2>

        <div className="h-4" />

        <div className="py-2">
          <h4 className="font-bold text-sm">Selected Files:</h4>
          <div className="grid grid-cols-1 gap-2 px-2">
            {selectedFiles.length !== 0 ? (
              selectedFiles.map((selectedFile) => (
                <PreviewBox
                  key={selectedFile.id}
                  id={selectedFile.id}
                  file={selectedFile.file}
                  onDeleteClick={() => handleFileDelete(selectedFile.id)}
                />
              ))
            ) : (
              <p className="italic text-xs">No selected files yet</p>
            )}
          </div>
        </div>

        <div
          className={classNames(
            "rounded-lg",
            "transition-all duration-200",
            "border-stone-400 border-2",
            { "border-dashed bg-stone-100": !isHovering },
            { "border-dotted bg-blue-200": isHovering }
          )}
          onDragEnter={() => setIsHovering(true)}
          onDragLeave={() => setIsHovering(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          <div className="flex items-center justify-center py-10 min-h-[250px]">
            {isHovering ? (
              <p className="pointer-events-none animate-bounce text-2xl">
                Drop Em!
              </p>
            ) : (
              <div className="flex items-center flex-col">
                <p className="text-xl">Drag and Drop Your File Here</p>
                <p className="text-md italic">or</p>
                <label
                  htmlFor={elementId}
                  className="bg-stone-300 hover:bg-stone-300/70 rounded-lg px-4 py-1 cursor-pointer text-xl"
                >
                  Select File
                </label>
                <input
                  onChange={handleSelectFileButton}
                  type="file"
                  id={elementId}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

interface PreviewBoxProps {
  id: string;
  file: File;
  onDeleteClick: () => void;
}

function PreviewBox({ file, onDeleteClick, id }: PreviewBoxProps) {
  const [imageUri, setImageUri] = useState<string>("");
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setImageUri(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  const fileExt = getFileExtension(file.name);
  const isPreviewable = ["jpg", "png", "jpeg"].includes(fileExt.toLowerCase());
  return (
    <div className="bg-slate-200 rounded-lg p-2 text-sm flex items-center justify-between group">
      {/* Left */}
      <div className="flex items-center justify-between gap-2">
        {isPreviewable ? (
          <img
            className="w-auto h-auto max-w-16 max-h-10"
            alt={`preview of ${file.name}`}
            src={imageUri}
          />
        ) : (
          <div className="flex flex-col bg-slate-700 rounded-xl text-white items-center p-2 w-auto h-auto max-w-16 max-h-10">
            <span className="text-xs">{fileExt}</span>
          </div>
        )}
        <p>{file.name}</p>
      </div>
      {/* Right */}
      <button
        type="button"
        className="hidden group-hover:block text-red-700 py-1 px-2 hover:bg-red-700 hover:text-red-50 rounded-lg transition-all duration-200"
        onClick={() => onDeleteClick()}
      >
        remove
      </button>
    </div>
  );
}

// Ref: https://stackoverflow.com/a/12900504/9844546
function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}
