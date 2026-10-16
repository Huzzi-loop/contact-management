import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from '../components/common/Badge';

describe('Badge component', () => {
  it('renders label with custom color', () => {
    render(<Badge label="VIP" color="#8B5CF6" />);
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('renders remove button when onRemove callback is provided', () => {
    const handleRemove = vi.fn();
    render(<Badge label="Customer" onRemove={handleRemove} />);
    const removeBtn = screen.getByRole('button', { name: /remove tag customer/i });
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });
});
