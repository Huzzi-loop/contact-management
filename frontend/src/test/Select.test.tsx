import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../components/common/Select';

describe('Select component', () => {
  const options = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ];

  it('renders select with options and handles selection change', () => {
    const handleChange = vi.fn();
    render(<Select label="Test Select" options={options} onChange={handleChange} />);
    expect(screen.getByLabelText(/test select/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/test select/i), { target: { value: 'opt2' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
