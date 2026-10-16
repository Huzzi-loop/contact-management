import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../components/common/Pagination';

describe('Pagination component', () => {
  const meta = {
    total: 45,
    page: 2,
    limit: 10,
    totalPages: 5,
  };

  it('renders range and total count', () => {
    render(<Pagination meta={meta} onPageChange={vi.fn()} />);
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('handles page navigation clicks', () => {
    const handlePageChange = vi.fn();
    render(<Pagination meta={meta} onPageChange={handlePageChange} />);

    // Click next page button
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
