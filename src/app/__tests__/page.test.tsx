import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import HomePage from "../page";

// Mock fetch
global.fetch = jest.fn();

// Helper to create ISO date string for a specific date
const getISODate = (daysFromNow = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

// Helper to create ISO datetime string
const getISODateTime = (date: string, hours: number, minutes = 0) => {
  return `${date}T${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
};

// Types for API responses
interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  signups: Array<{ id: string; name: string }>;
}

describe("HomePage", () => {
  beforeEach(() => {
    localStorage.clear();
    (global.fetch as jest.Mock).mockReset();
  });

  it("shows welcome form when no name is stored", () => {
    render(<HomePage />);
    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(screen.getByLabelText("Your Name")).toBeInTheDocument();
  });

  it("stores name in localStorage and shows timeslots after submission", async () => {
    const date = getISODate();
    const mockTimeslots: TimeSlot[] = [
      {
        id: "1",
        date,
        startTime: getISODateTime(date, 9),
        endTime: getISODateTime(date, 10),
        location: "Test Location",
        signups: [],
      },
    ];

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve(mockTimeslots) })
    );

    render(<HomePage />);

    const nameInput = screen.getByLabelText("Your Name") as HTMLInputElement;
    const submitButton = screen.getByText("Continue");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.submit(submitButton.closest("form")!);
    });

    expect(localStorage.getItem("myName")).toBe("Test User");

    await waitFor(() => {
      expect(screen.getByText("Available Time Slots")).toBeInTheDocument();
      expect(screen.getByText("Test Location")).toBeInTheDocument();
      expect(screen.getByText(/9:00 AM/)).toBeInTheDocument();
    });
  });

  it("shows next 14 days of dates", async () => {
    const date = getISODate();
    const mockTimeslots: TimeSlot[] = [
      {
        id: "1",
        date,
        startTime: getISODateTime(date, 9),
        endTime: getISODateTime(date, 10),
        location: "Test Location",
        signups: [],
      },
    ];

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve(mockTimeslots) })
    );

    localStorage.setItem("myName", "Test User");
    render(<HomePage />);

    await waitFor(() => {
      const dayHeaders = screen.getAllByRole("heading", { level: 2 });
      expect(dayHeaders).toHaveLength(14);
    });
  });

  it("shows empty state message for days without timeslots", async () => {
    const date = getISODate(1);
    const mockTimeslots: TimeSlot[] = [
      {
        id: "1",
        date,
        startTime: getISODateTime(date, 9),
        endTime: getISODateTime(date, 10),
        location: "Test Location",
        signups: [],
      },
    ];

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve(mockTimeslots) })
    );

    localStorage.setItem("myName", "Test User");
    render(<HomePage />);

    await waitFor(() => {
      const emptyMessages = screen.getAllByText(
        "No time slots available for this day"
      );
      expect(emptyMessages).toHaveLength(13);
    });
  });

  it("shows HELP NEEDED chip for slots without signups", async () => {
    const date = getISODate();
    const mockTimeslots: TimeSlot[] = [
      {
        id: "1",
        date,
        startTime: getISODateTime(date, 9),
        endTime: getISODateTime(date, 10),
        location: "Test Location",
        signups: [],
      },
    ];

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve(mockTimeslots) })
    );

    localStorage.setItem("myName", "Test User");
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("HELP NEEDED")).toBeInTheDocument();
    });
  });

  it("allows signing up and removing signup", async () => {
    const date = getISODate();
    const mockTimeslots: TimeSlot[] = [
      {
        id: "1",
        date,
        startTime: getISODateTime(date, 9),
        endTime: getISODateTime(date, 10),
        location: "Test Location",
        signups: [],
      },
    ];

    const mockTimeslotsWithSignup: TimeSlot[] = [
      {
        ...mockTimeslots[0],
        signups: [{ id: "1", name: "Test User" }],
      },
    ];

    let currentTimeslots = mockTimeslots;

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === "/api/timeslots") {
        return Promise.resolve({
          json: () => Promise.resolve(currentTimeslots),
        });
      }
      if (url === "/api/signups") {
        currentTimeslots = mockTimeslotsWithSignup;
        return Promise.resolve({
          json: () => Promise.resolve({ success: true }),
        });
      }
      if (url.includes("/api/signups/")) {
        currentTimeslots = mockTimeslots;
        return Promise.resolve({
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    localStorage.setItem("myName", "Test User");
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/9:00 AM/)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Test Location").closest("div")!);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Sign Up"));
    });

    await waitFor(() => {
      expect(
        screen.getByText("Test User", { selector: ".bg-blue-100" })
      ).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Remove Sign Up"));
    });

    await waitFor(() => {
      expect(screen.getByText("HELP NEEDED")).toBeInTheDocument();
    });
  });
});
