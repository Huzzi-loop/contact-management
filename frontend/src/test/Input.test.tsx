import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../components/common/Input';

describe('Input component', () => {
  it('renders with label and accepts text', () => {
    const handleChange = vi.fn();
    render(<Input label="First Name" value="John" onChange={handleChange} />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Johnny' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error text when provided', () => {
    render(<Input label="Email" error="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });
});
