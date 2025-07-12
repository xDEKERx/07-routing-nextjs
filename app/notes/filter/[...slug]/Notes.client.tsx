"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import { fetchNotes, FetchNotesHTTPResponse } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Loader from "@/components/Loader/Loader";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import Pagination from "@/components//Pagination/Pagination";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";

import css from "./page.module.css";

interface NotesClientProps {
  initialData?: FetchNotesHTTPResponse;
  tag?: string;
}

export default function NotesClient({ initialData, tag }: NotesClientProps) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [isModal, setIsModal] = useState(false);
  const [debouncedQuery] = useDebounce(query, 400);
  
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, tag]);

  const { data, isError, isLoading, isFetching, isSuccess } = useQuery({
    queryKey: ["notes", tag, debouncedQuery, page],
    queryFn: () => fetchNotes({ page: page, search: debouncedQuery, tag: tag }),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    initialData,
  });
  
  const handleCreateNote = () => {
    setIsModal(true);
  };
  const closeModal = () => {
    setIsModal(false);
  };

  return (
    <>
      <div className={css.app}>
        <header className={css.toolbar}>

          <SearchBox
            value={query}
            onChange={(query: string) => setQuery(query)}
          />

          {isSuccess && data.totalPages > 1 && (
            <Pagination
              pageCount={data.totalPages}
              currentPage={page}
              onPageChange={(selectedPage: number) => setPage(selectedPage)}
            />
          )}

          <button onClick={handleCreateNote} className={css.button}>
            Create note +
          </button>

        </header>

        {isModal && (
          <Modal onClose={closeModal}>
            <NoteForm onClose={closeModal} />
          </Modal>
        )}

        {(isLoading || isFetching) && <Loader />}

        {isError && <ErrorMessage />}

        {isSuccess && data?.notes?.length === 0 && <p>No notes found.</p>}

        {data?.notes && data?.notes?.length > 0 && (
          <NoteList notes={data.notes} />
        )}

      </div>
    </>
  );
}


