import streamlit as st

st.title("📞 Contact Us")
st.write("Have questions or feedback? Get in touch with our team.")

with st.form("contact_form"):
    name = st.text_input("Your Name")
    email = st.text_input("Email Address")
    message = st.text_area("Message")
    submitted = st.form_submit_button("Send Message")
    if submitted:
        st.success("Thank you! We'll get back to you soon.")
