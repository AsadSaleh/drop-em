import classNames from "classnames";
import { useEffect, useId, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface MyFile {
  id: string;
  file: File;
}

export default function App() {
  const elementId = useId();
  const [isHovering, setIsHovering] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Array<MyFile>>([]);
  return (
    <main className="container mx-auto w-full md:w-3/4 lg:w-1/2 px-2">
      <section>
        <h1 className="text-xl my-4">
          Welcome to "Drop Em!", a drag and drop example
        </h1>
        <div>
          <h4 className="font-bold text-sm">Selected Files:</h4>
          <div className="grid grid-cols-1 gap-2">
            {selectedFiles.length !== 0 ? (
              selectedFiles.map((selectedFile) => (
                <PreviewBox
                  key={selectedFile.id}
                  id={selectedFile.id}
                  file={selectedFile.file}
                />
              ))
            ) : (
              <p className="italic text-xs">No selected files yet</p>
            )}
          </div>
        </div>
        <div className="h-4" />
        {/* here we go */}
        <div
          className={classNames(
            "h-40 bg-stone-200 rounded-lg flex items-center justify-center",
            "transition-all duration-200",
            "border-stone-700 border-2",
            { "border-dashed": !isHovering },
            { "border-dotted": isHovering }
          )}
          onDragEnter={() => setIsHovering(true)}
          onDragLeave={() => setIsHovering(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setIsHovering(false);
            if (e.dataTransfer.items) {
              Array.from(e.dataTransfer.items).forEach((item, i) => {
                if (item.kind === "file") {
                  const file = item.getAsFile();
                  if (file) {
                    setSelectedFiles((curr) =>
                      curr.concat({ id: uuidv4(), file })
                    );
                  }
                }
              });
            }
          }}
        >
          {isHovering ? (
            <p className="pointer-events-none animate-bounce">Drop Em!</p>
          ) : (
            <div className="flex items-center flex-col">
              <label
                htmlFor={elementId}
                className="bg-stone-300 hover:bg-stone-300/70 rounded-lg px-4 py-1 cursor-pointer"
              >
                Select File
              </label>
              <input
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files).map((file) => ({
                      id: uuidv4(),
                      file,
                    }));
                    setSelectedFiles((cur) => cur.concat(files));
                  }
                }}
                type="file"
                id={elementId}
                className="hidden"
              />
              <p className="text-xs">Or</p>
              <p>Drag and Drop Your File Here</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

interface PreviewBoxProps {
  id: string;
  file: File;
}

function PreviewBox({ file }: PreviewBoxProps) {
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
    <div className="bg-slate-200 rounded-lg p-2 text-sm flex items-center justify-between">
      <p>{file.name}</p>
      {/* Do the preview here: */}
      {isPreviewable ? (
        <img
          className="w-auto h-auto max-w-8 max-h-8"
          alt={`preview of ${file.name}`}
          src={imageUri}
        />
      ) : (
        <span className="italic text-xs">No Preview</span>
      )}
    </div>
  );
}

// Ref: https://stackoverflow.com/a/12900504/9844546
function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}
