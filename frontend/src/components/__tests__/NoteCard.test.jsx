import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import NoteCard from '../NoteCard';

const mockNote = {
  _id: 'note1',
  title: 'Test Note',
  content: '<p>This is content</p>',
  tags: ['react', 'vitest'],
  updatedAt: new Date().toISOString(),
  deletedAt: null,
};

describe('NoteCard component', () => {
  it('should render the note title', () => {
    renderWithProviders(
      <NoteCard note={mockNote} onAction={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('should render note tags', () => {
    renderWithProviders(
      <NoteCard note={mockNote} onAction={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('vitest')).toBeInTheDocument();
  });

  it('should call onNavigate with note _id when card is clicked', () => {
    const onNavigate = vi.fn();
    renderWithProviders(
      <NoteCard note={mockNote} onAction={vi.fn()} onNavigate={onNavigate} />
    );

    const card = screen.getByText('Test Note').closest('div[class]');
    fireEvent.click(card);

    expect(onNavigate).toHaveBeenCalledWith('note1');
  });

  it('should call onAction("trash", id) when trash button clicked', () => {
    const onAction = vi.fn();
    renderWithProviders(
      <NoteCard note={mockNote} onAction={onAction} onNavigate={vi.fn()} />
    );

    // The trash button is the 2nd button rendered in normal (non-trash) mode
    const buttons = screen.getAllByRole('button');
    const trashBtn = buttons[1];

    fireEvent.click(trashBtn);

    expect(onAction).toHaveBeenCalledWith('trash', 'note1');
  });

  it('should render restore and delete buttons in trash mode', () => {
    const trashNote = { ...mockNote, deletedAt: new Date().toISOString() };
    renderWithProviders(
      <NoteCard note={trashNote} isTrash={true} onAction={vi.fn()} onNavigate={vi.fn()} />
    );

    expect(screen.getByTitle('Restore Note')).toBeInTheDocument();
    expect(screen.getByTitle('Delete Permanently')).toBeInTheDocument();
  });

  it('should call onAction("restore", id) when restore button clicked in trash mode', () => {
    const onAction = vi.fn();
    const trashNote = { ...mockNote, deletedAt: new Date().toISOString() };
    renderWithProviders(
      <NoteCard note={trashNote} isTrash={true} onAction={onAction} onNavigate={vi.fn()} />
    );

    fireEvent.click(screen.getByTitle('Restore Note'));
    expect(onAction).toHaveBeenCalledWith('restore', 'note1');
  });

  it('should show +N tag pill when note has more than 3 tags', () => {
    const noteWithManyTags = { ...mockNote, tags: ['a', 'b', 'c', 'd', 'e'] };
    renderWithProviders(
      <NoteCard note={noteWithManyTags} onAction={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});