"use client";

interface NumberPadProps {
  onInput: (value: string) => void;
}

export function NumberPad({ onInput }: NumberPadProps) {
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["C", "0", "DEL"],
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.flat().map((key) => {
        if (key === "C") {
          return (
            <button
              key={key}
              onClick={() => onInput(key)}
              className="numpad-btn-delete"
              type="button"
              aria-label="Clear"
            >
              C
            </button>
          );
        }

        if (key === "DEL") {
          return (
            <button
              key={key}
              onClick={() => onInput(key)}
              className="numpad-btn-delete"
              type="button"
              aria-label="Delete"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
              </svg>
            </button>
          );
        }

        return (
          <button
            key={key}
            onClick={() => onInput(key)}
            className="numpad-btn-number"
            type="button"
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
