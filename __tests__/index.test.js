import { render, screen } from '@testing-library/react';
import Home from '../src/app/page';
import Map from '../src/app/page';
import '@testing-library/jest-dom';
 
describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />)
    expect(screen.getByText(`Humanitarianism Project`)).toBeInTheDocument()
  });

  it('renders the map', () => {
    render(<Map />)
    const mapImage = screen.getByAltText('Map'); // Use the 'name' attribute as the accessible name
    expect(mapImage).toBeInTheDocument();
    expect(mapImage).toHaveAttribute('src', '/Picture1.png');
  });
});