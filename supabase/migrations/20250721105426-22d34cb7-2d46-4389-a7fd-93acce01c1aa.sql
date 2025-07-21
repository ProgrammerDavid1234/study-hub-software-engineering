-- Add teacher-specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
ADD COLUMN IF NOT EXISTS staff_id text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS qualification text,
ADD COLUMN IF NOT EXISTS matric_number text,
ADD COLUMN IF NOT EXISTS level text;

-- Update the trigger function to handle additional metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    avatar_url,
    role,
    staff_id,
    department,
    qualification,
    matric_number,
    level
  ) VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    '',
    'https://i.pravatar.cc/150?img=' || floor(random() * 70 + 1)::text,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'staffId',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'qualification',
    new.raw_user_meta_data->>'matricNumber',
    new.raw_user_meta_data->>'level'
  );
  RETURN new;
END;
$function$;