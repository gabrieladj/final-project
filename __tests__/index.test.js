import { render, screen } from '@testing-library/react';
//import Main from '../src/pages/index';
import Test from '../src/app/test/page';
import '@testing-library/jest-dom';
const { PrismaClient } = require('@prisma/client');
import { get_all_camp_stats } from '@/lib/stats';
 
describe('Home', () => {
  // it('renders a heading', () => {
  //   render(<Home />)
  //   expect(screen.getByText(`Humanitarianism Project`)).toBeInTheDocument()
  // });

  // it('Main component renders without errors', () => {
  //   render(<Main />);
  
  //   // Check if the canvas element is in the document
  //   const canvasElement = screen.getByTestId('canvas');
  //   expect(canvasElement).toBeInTheDocument();
  // });

  let prisma;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Test the test page', () => {
    render(<Test />);
    // Check if the canvas element is in the document
    const testElement = screen.getByTestId('test');
    expect(testElement).toBeInTheDocument();
  });
});

describe('database_test', () => {
  it('should return an array of camp stats', async () => {
    const stats = await get_all_camp_stats();
    
    expect(Array.isArray(stats)).toBe(true);
    stats.forEach(camp => {
      expect(camp).toHaveProperty('id');
      expect(camp).toHaveProperty('foodLevel');
      expect(camp).toHaveProperty('housingLevel');
      expect(camp).toHaveProperty('administrationLevel');
      expect(camp).toHaveProperty('healthcareLevel');
    });
  });
  it('Should retrieve a user from the database', async () => {
    // Assuming you have a User model
    const user = await prisma.user.findFirst();

    expect(user).toBeDefined(); // Check if a user was retrieved
  });
});