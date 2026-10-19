"use client";

import Link from "next/link";
import { BookCardProps } from "@/types";
import Image from "next/image";
import { Trash2, AlertTriangle, MoreVertical } from "lucide-react";
import { deleteBook } from "@/lib/actions/book.actions";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { useSession } from "@/hooks/useSession";

const BookCard = ({ id, title, author, coverURL, slug, isSample = false }: BookCardProps) => {
  const { session } = useSession();
  const userId = session?.userId;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const canManage = userId && !isSample;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setShowConfirm(false);
      const result = await deleteBook(id);

      if (result.success) {
        toast.success("Book deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete book");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("An error occurred while deleting the book");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <Link href={`/books/${slug}`}>
          <article className={`book-card ${isDeleting ? "opacity-50 grayscale" : ""}`}>
            <figure className="book-card-figure">
              <div className="book-card-cover-wrapper">
                <Image
                  src={coverURL || "/assets/book-cover.svg"}
                  alt={title}
                  width={133}
                  height={200}
                  className="book-card-cover"
                  priority={isSample}
                />
              </div>

              <figcaption className="book-card-meta">
                <h3 className="book-card-title">{title}</h3>
                <p className="book-card-author">{author}</p>
              </figcaption>
            </figure>
          </article>
        </Link>

        {/* More Options Menu (Three Dots) */}
        {canManage && (
          <div className="absolute top-2 right-2 z-20" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              disabled={isDeleting}
              className={`p-2 bg-white/90 text-[#212a3b] rounded-full transition-all shadow-md backdrop-blur-sm border border-black/5 hover:bg-white ${
                isMenuOpen ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90 hover:scale-100"
              }`}
              title="More options"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setShowConfirm(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
                >
                  <Trash2 size={16} />
                  Delete Material
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom ScholarSync Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#f3e4c7] p-6 flex flex-col items-center text-center">
              <div className="bg-white p-3 rounded-full mb-4 shadow-sm text-red-500">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#212a3b] font-serif">Remove Material?</h3>
              <p className="text-[#3d485e] text-sm mt-2 leading-relaxed">
                Are you sure you want to delete <span className="font-bold">"{title}"</span>? This action will remove all indexed segments and cannot be undone.
              </p>
            </div>
            
            <div className="p-4 flex flex-col gap-2">
              <button
                onClick={handleDelete}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-sm text-sm"
              >
                Yes, Delete Material
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-[#212a3b] font-bold rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookCard;
