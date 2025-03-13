import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "../page";

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

describe("HomePage", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    );
  });

  it("shows name input form when no name is stored", () => {
    render(<HomePage />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toBeInTheDocument();
  });

  it("saves name to localStorage when form is submitted", async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    const nameInput = screen.getByLabelText(/your name/i);
    const submitButton = screen.getByRole("button", { name: /continue/i });

    await act(async () => {
      await user.type(nameInput, "John Doe");
    });

    await act(async () => {
      await user.click(submitButton);
    });

    expect(localStorage.getItem("myName")).toBe("John Doe");
  });

  it("does not save empty name to localStorage", async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    const submitButton = screen.getByRole("button", { name: /continue/i });
    await act(async () => {
      await user.click(submitButton);
    });

    expect(localStorage.getItem("myName")).toBeNull();
  });

  it("shows timeslots when name is stored", async () => {
    localStorage.setItem("myName", "John Doe");
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              id: "1",
              date: "2024-03-20",
              startTime: "2024-03-20T10:00:00",
              endTime: "2024-03-20T12:00:00",
              location: "Test Location",
              signups: [],
            },
          ]),
      })
    );

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/available time slots/i)).toBeInTheDocument();
      expect(screen.getByText(/signed in as: john doe/i)).toBeInTheDocument();
    });
  });

  it("allows signing up for a timeslot", async () => {
    const user = userEvent.setup();
    localStorage.setItem("myName", "John Doe");
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve([
              {
                id: "1",
                date: "2024-03-20",
                startTime: "2024-03-20T10:00:00",
                endTime: "2024-03-20T12:00:00",
                location: "Test Location",
                signups: [],
              },
            ]),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve([
              {
                id: "1",
                date: "2024-03-20",
                startTime: "2024-03-20T10:00:00",
                endTime: "2024-03-20T12:00:00",
                location: "Test Location",
                signups: [{ id: "1", name: "John Doe", note: "Test note" }],
              },
            ]),
        })
      );

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/available time slots/i)).toBeInTheDocument();
    });

    const noteInput = screen.getByPlaceholderText(/optional note/i);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });

    await act(async () => {
      await user.type(noteInput, "Test note");
      await user.click(signUpButton);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/signups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John Doe",
        note: "Test note",
        timeSlotId: "1",
      }),
    });
  });
});
