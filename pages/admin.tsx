import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BookWithAuthors } from '../types/book';

type FormMode = { mode: 'create' } | { mode: 'edit'; bookId: number };
type Message = { type: 'success' | 'error'; text: string } | null;

export default function Admin() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [finishedOn, setFinishedOn] = useState<Date | null>(null);
  const [authors, setAuthors] = useState('');

  // UI state
  const [formMode, setFormMode] = useState<FormMode>({ mode: 'create' });
  const [books, setBooks] = useState<BookWithAuthors[]>([]);
  const [message, setMessage] = useState<Message>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      await fetch('/api/admin-logout', { method: 'POST' });
      router.push('/admin-login');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to logout' });
    }
  }

  // Fetch books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function fetchBooks() {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      if (data.success) {
        setBooks(data.data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch books' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while fetching books' });
    }
  }

  function resetForm() {
    setTitle('');
    setCoverUrl('');
    setFinishedOn(null);
    setAuthors('');
    setFormMode({ mode: 'create' });
  }

  function handleEdit(book: BookWithAuthors) {
    setTitle(book.title);
    setCoverUrl(book.coverUrl);
    setFinishedOn(new Date(book.finishedOn));
    setAuthors(book.authors.map((a) => a.name).join(', '));
    setFormMode({ mode: 'edit', bookId: book.id });
  }

  async function handleDelete(bookId: number, bookTitle: string) {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Book deleted successfully!' });
        await fetchBooks();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete book' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while deleting book' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Validate and process authors
    const authorNames = authors
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (authorNames.length === 0) {
      setMessage({ type: 'error', text: 'Please enter at least one author' });
      return;
    }

    if (!finishedOn) {
      setMessage({ type: 'error', text: 'Please select a finished date' });
      return;
    }

    setLoading(true);

    try {
      const body = {
        title,
        coverUrl,
        finishedOn: finishedOn.toISOString(),
        authors: authorNames,
      };

      const isEdit = formMode.mode === 'edit';
      const url = isEdit ? `/api/books/${formMode.bookId}` : '/api/books';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Book ${isEdit ? 'updated' : 'created'} successfully!`,
        });
        resetForm();
        await fetchBooks();
      } else {
        setMessage({ type: 'error', text: data.error || `Failed to ${isEdit ? 'update' : 'create'} book` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while saving book' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin - Book Management</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Management</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {formMode.mode === 'create' ? 'Add New Book' : 'Edit Book'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="coverUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Cover URL *
                </label>
                <input
                  id="coverUrl"
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="finishedOn" className="block text-sm font-medium text-gray-700 mb-1">
                  Finished Date *
                </label>
                <DatePicker
                  id="finishedOn"
                  selected={finishedOn}
                  onChange={(date) => setFinishedOn(date)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div>
                <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-1">
                  Authors (comma-separated) *
                </label>
                <input
                  id="authors"
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  required
                  placeholder="e.g., Robert McKee, Austin Kleon"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading
                    ? 'Saving...'
                    : formMode.mode === 'create'
                    ? 'Create Book'
                    : 'Update Book'}
                </button>
                {formMode.mode === 'edit' && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Book List Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Existing Books ({books.length})</h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {books.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No books yet. Add your first book!</p>
              ) : (
                books.map((book) => (
                  <div
                    key={book.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-24 relative bg-gray-200 rounded">
                          <Image
                            src={book.coverUrl}
                            alt={book.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {book.authors.map((a) => a.name).join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Finished: {new Date(book.finishedOn).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          disabled={loading}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
